import { SpaceSettings } from "../settings/SpaceSettings";
import { filterType } from "../tools/Array";
import { UserScript } from "../UserScript";
import { HeaderListItem } from "./components/HeaderListItem";
import { SettingListItem } from "./components/SettingListItem";
import { SettingMaxListItem } from "./components/SettingMaxListItem";
import { TriggerButton } from "./components/TriggerButton";
import { MissionSettingsUi } from "./MissionSettingsUi";
import { SettingsSectionUi } from "./SettingsSectionUi";

export class SpaceSettingsUi extends SettingsSectionUi<SpaceSettings> {
  private readonly _trigger: TriggerButton;
  private readonly _buildings: Array<SettingListItem>;
  private readonly _missionsUi: MissionSettingsUi;

  constructor(host: UserScript, settings: SpaceSettings) {
    const label = host.engine.i18n("ui.space");
    super(host, label, settings);

    // Create "trigger" button in the item.
    this._trigger = new TriggerButton(host, label, settings);
    this._trigger.element.insertBefore(this.list);
    this.children.add(this._trigger);

    this._list.addEventListener("enableAll", () => {
      this._buildings.forEach(item => (item.setting.enabled = true));
      this.refreshUi();
    });
    this._list.addEventListener("disableAll", () => {
      this._buildings.forEach(item => (item.setting.enabled = false));
      this.refreshUi();
    });
    this._list.addEventListener("reset", () => {
      this.setting.load(new SpaceSettings());
      this.refreshUi();
    });

    const uiElements = [
      new HeaderListItem(this._host, this._host.engine.i18n("$space.planet.cath.label")),
      this._getBuildOption(
        this.setting.buildings.spaceElevator,
        this._host.engine.i18n("$space.planet.cath.spaceElevator.label")
      ),
      this._getBuildOption(
        this.setting.buildings.sattelite,
        this._host.engine.i18n("$space.planet.cath.sattelite.label")
      ),
      this._getBuildOption(
        this.setting.buildings.spaceStation,
        this._host.engine.i18n("$space.planet.cath.spaceStation.label"),
        true
      ),

      new HeaderListItem(this._host, this._host.engine.i18n("$space.planet.moon.label")),
      this._getBuildOption(
        this.setting.buildings.moonOutpost,
        this._host.engine.i18n("$space.planet.moon.moonOutpost.label")
      ),
      this._getBuildOption(
        this.setting.buildings.moonBase,
        this._host.engine.i18n("$space.planet.moon.moonBase.label"),
        true
      ),

      new HeaderListItem(this._host, this._host.engine.i18n("$space.planet.dune.label")),
      this._getBuildOption(
        this.setting.buildings.planetCracker,
        this._host.engine.i18n("$space.planet.dune.planetCracker.label")
      ),
      this._getBuildOption(
        this.setting.buildings.hydrofracturer,
        this._host.engine.i18n("$space.planet.dune.hydrofracturer.label")
      ),
      this._getBuildOption(
        this.setting.buildings.spiceRefinery,
        this._host.engine.i18n("$space.planet.dune.spiceRefinery.label"),
        true
      ),

      new HeaderListItem(this._host, this._host.engine.i18n("$space.planet.piscine.label")),
      this._getBuildOption(
        this.setting.buildings.researchVessel,
        this._host.engine.i18n("$space.planet.piscine.researchVessel.label")
      ),
      this._getBuildOption(
        this.setting.buildings.orbitalArray,
        this._host.engine.i18n("$space.planet.piscine.orbitalArray.label"),
        true
      ),

      new HeaderListItem(this._host, this._host.engine.i18n("$space.planet.helios.label")),
      this._getBuildOption(
        this.setting.buildings.sunlifter,
        this._host.engine.i18n("$space.planet.helios.sunlifter.label")
      ),
      this._getBuildOption(
        this.setting.buildings.containmentChamber,
        this._host.engine.i18n("$space.planet.helios.containmentChamber.label")
      ),
      this._getBuildOption(
        this.setting.buildings.heatsink,
        this._host.engine.i18n("$space.planet.helios.heatsink.label")
      ),
      this._getBuildOption(
        this.setting.buildings.sunforge,
        this._host.engine.i18n("$space.planet.helios.sunforge.label"),
        true
      ),

      new HeaderListItem(this._host, this._host.engine.i18n("$space.planet.terminus.label")),
      this._getBuildOption(
        this.setting.buildings.cryostation,
        this._host.engine.i18n("$space.planet.terminus.cryostation.label"),
        true
      ),

      new HeaderListItem(this._host, this._host.engine.i18n("$space.planet.kairo.label")),
      this._getBuildOption(
        this.setting.buildings.spaceBeacon,
        this._host.engine.i18n("$space.planet.kairo.spaceBeacon.label"),
        true
      ),

      new HeaderListItem(this._host, this._host.engine.i18n("$space.planet.yarn.label")),
      this._getBuildOption(
        this.setting.buildings.terraformingStation,
        this._host.engine.i18n("$space.planet.yarn.terraformingStation.label")
      ),
      this._getBuildOption(
        this.setting.buildings.hydroponics,
        this._host.engine.i18n("$space.planet.yarn.hydroponics.label"),
        true
      ),

      new HeaderListItem(this._host, this._host.engine.i18n("$space.planet.umbra.label")),
      this._getBuildOption(
        this.setting.buildings.hrHarvester,
        this._host.engine.i18n("$space.planet.umbra.hrHarvester.label"),
        true
      ),

      new HeaderListItem(this._host, this._host.engine.i18n("$space.planet.charon.label")),
      this._getBuildOption(
        this.setting.buildings.entangler,
        this._host.engine.i18n("$space.planet.charon.entangler.label"),
        true
      ),

      new HeaderListItem(this._host, this._host.engine.i18n("$space.planet.centaurusSystem.label")),
      this._getBuildOption(
        this.setting.buildings.tectonic,
        this._host.engine.i18n("$space.planet.centaurusSystem.tectonic.label")
      ),
      this._getBuildOption(
        this.setting.buildings.moltenCore,
        this._host.engine.i18n("$space.planet.centaurusSystem.moltenCore.label"),
        true
      ),
    ];
    this._buildings = filterType(uiElements, SettingMaxListItem);
    this.addChildren(uiElements);

    this.addChild(new HeaderListItem(this._host, "Additional options"));

    this._missionsUi = new MissionSettingsUi(this._host, this.setting.unlockMissions);
    this.addChild(this._missionsUi);
  }
}
