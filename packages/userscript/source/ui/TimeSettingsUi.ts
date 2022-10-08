import { TimeSettings, TimeSettingsItem } from "../options/TimeSettings";
import { objectEntries } from "../tools/Entries";
import { ucfirst } from "../tools/Format";
import { mustExist } from "../tools/Maybe";
import { UserScript } from "../UserScript";
import { SettingMaxUi } from "./SettingMaxUi";
import { SettingsListUi } from "./SettingsListUi";
import { SettingsPanelUi } from "./SettingsPanelUi";
import { SettingsSectionUi } from "./SettingsSectionUi";

export class TimeSettingsUi extends SettingsSectionUi {
  readonly element: JQuery<HTMLElement>;
  readonly mainChild: JQuery<HTMLElement>;

  private readonly _settings: TimeSettings;

  constructor(host: UserScript, settings: TimeSettings) {
    super(host);

    this._settings = settings;

    const toggleName = "time";
    const label = ucfirst(this._host.engine.i18n("ui.time"));

    // Create build items.
    // We create these in a list that is displayed when the user clicks the "items" button.
    const list = SettingsListUi.getSettingsList(this._host.engine, toggleName);

    // Our main element is a list item.
    const element = SettingsPanelUi.make(this._host, toggleName, label, this._settings, list);

    // Create "trigger" button in the item.
    this._settings.$trigger = this._makeSectionTriggerButton(toggleName, label, this._settings);

    const optionButtons = [
      this._getTimeSetting(
        "temporalBattery",
        this._settings.items.temporalBattery,
        this._host.engine.i18n("$time.cfu.temporalBattery.label")
      ),
      this._getTimeSetting(
        "blastFurnace",
        this._settings.items.blastFurnace,
        this._host.engine.i18n("$time.cfu.blastFurnace.label")
      ),
      this._getTimeSetting(
        "timeBoiler",
        this._settings.items.timeBoiler,
        this._host.engine.i18n("$time.cfu.timeBoiler.label")
      ),
      this._getTimeSetting(
        "temporalAccelerator",
        this._settings.items.temporalAccelerator,
        this._host.engine.i18n("$time.cfu.temporalAccelerator.label")
      ),
      this._getTimeSetting(
        "temporalImpedance",
        this._settings.items.temporalImpedance,
        this._host.engine.i18n("$time.cfu.temporalImpedance.label")
      ),
      this._getTimeSetting(
        "ressourceRetrieval",
        this._settings.items.ressourceRetrieval,
        this._host.engine.i18n("$time.cfu.ressourceRetrieval.label"),
        true
      ),

      this._getTimeSetting(
        "cryochambers",
        this._settings.items.cryochambers,
        this._host.engine.i18n("$time.vsu.cryochambers.label")
      ),
      this._getTimeSetting(
        "voidHoover",
        this._settings.items.voidHoover,
        this._host.engine.i18n("$time.vsu.voidHoover.label")
      ),
      this._getTimeSetting(
        "voidRift",
        this._settings.items.voidRift,
        this._host.engine.i18n("$time.vsu.voidRift.label")
      ),
      this._getTimeSetting(
        "chronocontrol",
        this._settings.items.chronocontrol,
        this._host.engine.i18n("$time.vsu.chronocontrol.label")
      ),
      this._getTimeSetting(
        "voidResonator",
        this._settings.items.voidResonator,
        this._host.engine.i18n("$time.vsu.voidResonator.label")
      ),
    ];

    list.append(...optionButtons);

    element.append(this._settings.$trigger);
    element.append(list);

    this.element = element;
    this.mainChild = list;
  }

  private _getTimeSetting(
    name: string,
    setting: TimeSettingsItem,
    label: string,
    delimiter = false
  ) {
    return SettingMaxUi.make(
      this._host,
      name,
      setting,
      label,
      {
        onCheck: () => this._host.engine.imessage("status.auto.enable", [label]),
        onUnCheck: () => this._host.engine.imessage("status.auto.disable", [label]),
      },
      delimiter
    );
  }

  setState(state: TimeSettings): void {
    this._settings.enabled = state.enabled;
    this._settings.trigger = state.trigger;

    for (const [name, option] of objectEntries(this._settings.items)) {
      option.enabled = state.items[name].enabled;
    }
  }

  refreshUi(): void {
    this.setState(this._settings);

    mustExist(this._settings.$enabled).prop("checked", this._settings.enabled);
    mustExist(this._settings.$trigger)[0].title = SettingsSectionUi.renderPercentage(
      this._settings.trigger
    );

    for (const [name, option] of objectEntries(this._settings.items)) {
      mustExist(option.$enabled).prop("checked", this._settings.items[name].enabled);
      mustExist(option.$max).text(
        this._host.engine.i18n("ui.max", [this._renderLimit(this._settings.items[name].max)])
      );
    }
  }
}
