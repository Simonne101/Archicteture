// Estimation légère du nombre de pages d'un PDF, sans dépendance lourde de
// rendu : on compte les occurrences de `/Type /Page` (en excluant `/Pages`)
// dans le flux brut du fichier. Fonctionne pour la grande majorité des PDF
// non compressés ; à défaut, on retombe sur 1 page.
export async function estimatePdfPageCount(file: File): Promise<number> {
  const buffer = await file.arrayBuffer();
  const text = new TextDecoder("latin1").decode(buffer);
  const matches = text.match(/\/Type\s*\/Page(?!s)/g);
  return matches && matches.length > 0 ? matches.length : 1;
}
