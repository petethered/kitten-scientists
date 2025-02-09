import { EngineSettings } from "../settings/EngineSettings";
import { ucfirst } from "../tools/Format";
import { UserScript } from "../UserScript";
import { CopyButton } from "./components/CopyButton";
import { ExpandoButton } from "./components/ExpandoButton";
import { ImportButton } from "./components/ImportButton";
import { SettingListItem } from "./components/SettingListItem";

export class EngineSettingsUi {
  readonly copyButton: CopyButton;
  readonly element: JQuery<HTMLElement>;
  readonly expando: ExpandoButton;
  readonly importButton: ImportButton;
  private readonly _element: SettingListItem;
  private readonly _settings: EngineSettings;

  constructor(host: UserScript, settings: EngineSettings) {
    this._settings = settings;

    const itext = ucfirst(host.engine.i18n("ui.engine"));

    // Our main element is a list item.
    this._element = new SettingListItem(host, itext, settings, {
      onCheck: () => host.engine.start(true),
      onUnCheck: () => host.engine.stop(true),
    });
    this.element = this._element.element;

    this.expando = new ExpandoButton(host);
    this.element.append(this.expando.element);

    this.copyButton = new CopyButton(host, "Copy settings to clipboard");
    this.element.append(this.copyButton.element);

    this.importButton = new ImportButton(host, "Import settings");
    this.element.append(this.importButton.element);
  }

  setState(state: EngineSettings): void {
    this._settings.enabled = state.enabled;
  }

  refreshUi(): void {
    this.setState(this._settings);

    this._element.refreshUi();
  }
}
