import { getPlatformSettings } from "@/lib/platform-settings";
import { MaterialsSettingsClient } from "@/components/admin/materials-settings-client";

export default async function AdminMaterialsPage() {
  const settings = await getPlatformSettings();

  return (
    <MaterialsSettingsClient
      settings={{
        prixCimentSac: settings.prixCimentSac,
        prixParpaing: settings.prixParpaing,
        prixFerBarre: settings.prixFerBarre,
        prixSableM3: settings.prixSableM3,
        prixGravierM3: settings.prixGravierM3,
        prixBoisM3: settings.prixBoisM3,
        prixToleFeuille: settings.prixToleFeuille,
      }}
    />
  );
}
