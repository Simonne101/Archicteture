import {
  Box,
  Calculator,
  ClipboardCheck,
  Clock,
  Coins,
  Download,
  Droplet,
  FileText,
  Hexagon,
  Ruler,
  Scan,
  ShieldCheck,
  Upload,
  Users,
} from "lucide-react";
import type { IconTile, MaterialItem, NavLinkItem, RebarRow } from "../types/content";

export const navLinks: NavLinkItem[] = [
  { label: "Accueil", href: "#accueil" },
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Comment ça marche", href: "#comment" },
];

export const features: IconTile[] = [
  {
    icon: Upload,
    title: "Importez votre plan",
    description: "PDF, JPG ou PNG. Plans 2D ou 3D acceptés.",
    iconClassName: "text-primary",
    bgClassName: "bg-primary/10",
  },
  {
    icon: Scan,
    title: "Analyse intelligente",
    description:
      "Notre IA détecte automatiquement les éléments clés : dimensions, structures, ouvertures, niveaux...",
    iconClassName: "text-accent-violet",
    bgClassName: "bg-accent-violet/10",
  },
  {
    icon: Calculator,
    title: "Estimation détaillée",
    description: "Quantités précises de chaque matériau, du sous-sol jusqu'au toit.",
    iconClassName: "text-accent-orange",
    bgClassName: "bg-accent-orange/10",
  },
  {
    icon: FileText,
    title: "Rapport professionnel",
    description: "Téléchargez un rapport complet et partagez-le avec vos équipes ou vos clients.",
    iconClassName: "text-accent-green",
    bgClassName: "bg-accent-green/10",
  },
];

export const workflowSteps: IconTile[] = [
  {
    icon: Upload,
    title: "Téléchargez votre plan",
    description: "Importez votre plan au format PDF, JPG ou PNG.",
    iconClassName: "text-primary",
    bgClassName: "bg-primary/10",
  },
  {
    icon: Scan,
    title: "Notre IA analyse",
    description: "L'IA détecte et mesure automatiquement tous les éléments importants du plan.",
    iconClassName: "text-accent-violet",
    bgClassName: "bg-accent-violet/10",
  },
  {
    icon: ClipboardCheck,
    title: "Vérifiez & ajustez",
    description: "Confirmez les données détectées et ajustez si nécessaire avant le calcul.",
    iconClassName: "text-accent-orange",
    bgClassName: "bg-accent-orange/10",
  },
  {
    icon: FileText,
    title: "Recevez l'estimation",
    description: "Obtenez la liste complète des matériaux et quantités nécessaires.",
    iconClassName: "text-accent-green",
    bgClassName: "bg-accent-green/10",
  },
  {
    icon: Download,
    title: "Exportez & partagez",
    description: "Téléchargez le rapport et partagez-le en un clic avec vos équipes.",
    iconClassName: "text-accent-blue",
    bgClassName: "bg-accent-blue/10",
  },
];

export const benefits: IconTile[] = [
  {
    icon: ShieldCheck,
    title: "Précision garantie",
    description: "Calculs conformes aux normes et méthodes de construction.",
    iconClassName: "text-primary",
    bgClassName: "",
  },
  {
    icon: Clock,
    title: "Gain de temps",
    description: "Économisez des heures de travail sur chaque projet.",
    iconClassName: "text-accent-violet",
    bgClassName: "",
  },
  {
    icon: Coins,
    title: "Réduction des coûts",
    description: "Évitez les erreurs et les surdimensions de matériaux.",
    iconClassName: "text-accent-orange",
    bgClassName: "",
  },
  {
    icon: Users,
    title: "Collaboration simplifiée",
    description: "Partagez et travaillez avec vos équipes en temps réel.",
    iconClassName: "text-accent-green",
    bgClassName: "",
  },
  {
    icon: ShieldCheck,
    title: "Sécurisé & confidentiel",
    description: "Vos plans et données sont protégés à 100%.",
    iconClassName: "text-accent-blue",
    bgClassName: "",
  },
];

export const materials: MaterialItem[] = [
  { icon: Box, label: "Ciment", value: "12,45", unit: "tonnes", iconClassName: "text-accent-orange" },
  { icon: Droplet, label: "Sable", value: "18,63", unit: "m³", iconClassName: "text-accent-orange" },
  { icon: Hexagon, label: "Gravillon", value: "22,37", unit: "m³", iconClassName: "text-text-muted" },
];

export const rebarRows: RebarRow[] = [
  { size: "Ø 8 mm", count: "1 245" },
  { size: "Ø 10 mm", count: "2 560" },
  { size: "Ø 12 mm", count: "1 124" },
  { size: "Ø 16 mm", count: "645" },
  { size: "Ø 20 mm", count: "320" },
];

export const rebarIcon = Ruler;
