import JQuery from "jquery";
import { Engine, SupportedLanguages } from "./Engine";

import { BonfireSettings } from "./options/BonfireSettings";
import { EngineSettings } from "./options/EngineSettings";
import { Options } from "./options/Options";
import { ReligionSettings } from "./options/ReligionSettings";
import { ScienceSettings } from "./options/ScienceSettings";
import { KittenStorageType, SettingsStorage } from "./options/SettingsStorage";
import { SpaceSettings } from "./options/SpaceSettings";
import { TimeControlSettings } from "./options/TimeControlSettings";
import { TimeSettings } from "./options/TimeSettings";
import { TradeSettings } from "./options/TradeSettings";
import { VillageSettings } from "./options/VillageSettings";
import { WorkshopSettings } from "./options/WorkshopSettings";
import { cdebug, cinfo, clog, cwarn } from "./tools/Log";
import { isNil, Maybe, mustExist } from "./tools/Maybe";
import { sleep } from "./tools/Sleep";
import { GamePage } from "./types";
import { UserInterface } from "./ui/UserInterface";

declare global {
  const KG_SAVEGAME: string | null;
  const KS_VERSION: string | null;
  let unsafeWindow: Window | undefined;
  const dojo: {
    clone: <T>(subject: T) => T;
    subscribe: (event: string, handler: () => void) => void;
  };
  interface Window {
    gamePage?: Maybe<GamePage>;
    $: JQuery;
    $I?: Maybe<I18nEngine>;
  }
}

export type I18nEngine = (key: string, args?: Array<number | string>) => string;

export const DefaultLanguage: SupportedLanguages = "en";

export class UserScript {
  readonly gamePage: GamePage;

  /**
   * A function in the game that allows to retrieve translated messages.
   *
   * Ideally, you should never access this directly and instead use the
   * i18n interface provided by `Engine`.
   */
  readonly i18nEngine: I18nEngine;

  /**
   * The currently selected language.
   */
  private _language: SupportedLanguages;

  get language() {
    return this._language;
  }

  /**
   * Signals whether the options have been changed since they were last saved.
   */
  private _optionsDirty = false;
  private _intervalSaveSettings: number | undefined = undefined;

  /**
   * Stores if we caught the `game/start` signal from the game.
   */
  private static _gameStartSignal: Promise<boolean>;
  private static _gameStartSignalResolver: undefined | ((value: boolean) => void);

  private _userInterface: UserInterface;
  engine: Engine;

  constructor(
    gamePage: GamePage,
    i18nEngine: I18nEngine,
    language: SupportedLanguages = DefaultLanguage
  ) {
    cinfo("Kitten Scientists constructed.");

    this.gamePage = gamePage;
    this.i18nEngine = i18nEngine;
    this._language = language;

    this.engine = new Engine(this);
    this._userInterface = new UserInterface(this);
    this._userInterface.construct();
    this._userInterface.refreshUi();

    // Every 30 seconds, check if we need to save our settings.
    this._intervalSaveSettings = setInterval(this._checkOptions.bind(this), 30 * 1000);
  }

  /**
   * Runs some validations against the game to determine if internal control
   * structures still match up with expectations.
   * Issues should be logged to the console.
   */
  validateGame() {
    ScienceSettings.validateGame(this.gamePage, this.engine.scienceManager.settings);
    SpaceSettings.validateGame(this.gamePage, this.engine.spaceManager.settings);
    WorkshopSettings.validateGame(this.gamePage, this.engine.workshopManager.settings);
  }

  run(): void {
    if (!this.engine.isLanguageSupported(this._language)) {
      cwarn(
        `Requested language '${this._language}' is not available. Falling back to '${DefaultLanguage}'.`
      );
      this._language = DefaultLanguage;
    }

    // Increase messages displayed in log
    // TODO: This should be configurable.
    this.gamePage.console.maxMessages = 1000;

    this.refreshUi();

    if (this.engine.settings.enabled) {
      this.engine.start(true);
    }

    cinfo("Kitten Scientists initialized.");
  }

  refreshUi() {
    this._userInterface.refreshUi();
  }

  loadLegacyOptions(source: KittenStorageType) {
    this.engine.load({
      bonfire: BonfireSettings.fromLegacyOptions(source),
      engine: EngineSettings.fromLegacyOptions(source),
      religion: ReligionSettings.fromLegacyOptions(source),
      science: ScienceSettings.fromLegacyOptions(source),
      space: SpaceSettings.fromLegacyOptions(source),
      time: TimeSettings.fromLegacyOptions(source),
      timeControl: TimeControlSettings.fromLegacyOptions(source),
      trade: TradeSettings.fromLegacyOptions(source),
      village: VillageSettings.fromLegacyOptions(source),
      workshop: WorkshopSettings.fromLegacyOptions(source),
    });
  }

  /**
   * Signal that the settings should be saved again.
   *
   * @param updater A function that will manipulate the settings before they're saved.
   */
  updateOptions(updater?: () => void): void {
    cdebug("Settings will be updated.");
    if (updater) {
      updater();
    }
    this._optionsDirty = true;
  }

  private _checkOptions(): void {
    if (this._optionsDirty) {
      this.saveSettings();
    }
  }

  saveSettings() {
    this._optionsDirty = false;

    const toExport = Options.asLegacyOptions({
      bonfire: this.engine.bonfireManager.settings,
      engine: this.engine.settings,
      religion: this.engine.religionManager.settings,
      science: this.engine.scienceManager.settings,
      space: this.engine.spaceManager.settings,
      time: this.engine.timeManager.settings,
      timeControl: this.engine.timeControlManager.settings,
      trading: this.engine.tradeManager.settings,
      village: this.engine.villageManager.settings,
      workshop: this.engine.workshopManager.settings,
    });
    SettingsStorage.setLegacySettings(toExport);
    clog("Kitten Scientists settings saved.");
  }

  static async waitForGame(timeout = 30000): Promise<GamePage> {
    if (isNil(UserScript._gameStartSignal) && dojo) {
      UserScript._gameStartSignal = new Promise(resolve => {
        UserScript._gameStartSignalResolver = resolve;
      });

      dojo.subscribe("game/start", () => {
        cdebug("`game/start` signal caught. Fast-tracking script load...");
        mustExist(UserScript._gameStartSignalResolver)(true);
      });
    }

    if (timeout < 0) {
      throw new Error("Unable to find game page. Giving up.");
    }

    if (UserScript._isGameLoaded()) {
      return mustExist(UserScript._window.gamePage);
    }

    cdebug(`Waiting for game... (timeout: ${Math.round(timeout / 1000)}s)`);

    await Promise.race([UserScript._gameStartSignal, sleep(2000)]);
    return UserScript.waitForGame(timeout - 2000);
  }

  static getDefaultInstance(): UserScript {
    const instance = new UserScript(
      mustExist(UserScript._window.gamePage),
      mustExist(UserScript._window.$I),
      localStorage["com.nuclearunicorn.kittengame.language"] as SupportedLanguages | undefined
    );
    return instance;
  }

  private static _isGameLoaded(): boolean {
    return !isNil(UserScript._window.gamePage);
  }

  private static get _window(): Window {
    try {
      return unsafeWindow as Window;
    } catch (error) {
      return window;
    }
  }
}
