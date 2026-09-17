// Miroir front de gem-market-backend/src/listings/job-sectors.ts — sous-
// catégorisation des annonces "emploi" + grille de critères recherchés par
// l'employeur (ou décrivant le profil du candidat côté "recherche"), pensée
// pour le marché du travail abidjanais (emplois formels ET secteur informel,
// très majoritaire dans la réalité locale).
//
// Volontairement EXCLUS des critères : âge, sexe/genre, religion, ethnie,
// situation matrimoniale ou grossesse — on ne construit pas de filtre qui
// permettrait à un employeur d'exiger un critère de recrutement discriminatoire.

export interface JobSector {
  id: string;
  label: string;
  examples: string[];
}

export const JOB_SECTORS: JobSector[] = [
  { id: "commerce_vente", label: "Commerce & Vente", examples: ["Vendeur(se) boutique", "Caissier(ère)", "Commercial(e) terrain", "Gérant(e) de boutique", "Marchand(e) ambulant(e)"] },
  { id: "informatique_digital", label: "Informatique & Digital", examples: ["Développeur(se) web/mobile", "Technicien(ne) informatique", "Community manager", "Graphiste", "Agent(e) de saisie"] },
  { id: "finance_comptabilite", label: "Comptabilité, Finance & Gestion", examples: ["Comptable", "Aide-comptable", "Caissier(ère) banque", "Gestionnaire de stock", "Auditeur(trice)"] },
  { id: "batiment_travaux", label: "Bâtiment & Travaux Publics (BTP)", examples: ["Maçon(ne)", "Électricien(ne) bâtiment", "Plombier(ère)", "Peintre en bâtiment", "Chef de chantier", "Ingénieur(e) BTP"] },
  { id: "transport_logistique", label: "Transport & Logistique", examples: ["Chauffeur(se)", "Livreur(se)/coursier(ère) moto", "Magasinier(ère)", "Logisticien(ne)"] },
  { id: "restauration_hotellerie", label: "Restauration & Hôtellerie", examples: ["Cuisinier(ère)", "Serveur(se)", "Gérant(e) de maquis/restaurant", "Réceptionniste", "Femme/valet de chambre"] },
  { id: "artisanat_reparation", label: "Artisanat & Réparation", examples: ["Couturier(ère)", "Cordonnier(ère)", "Menuisier(ère)", "Soudeur(se)", "Mécanicien(ne) auto/moto", "Réparateur(trice) électroménager"] },
  { id: "beaute_bien_etre", label: "Coiffure, Beauté & Bien-être", examples: ["Coiffeur(se)", "Esthéticien(ne)", "Manucure", "Masseur(se)"] },
  { id: "sante", label: "Santé", examples: ["Infirmier(ère)", "Aide-soignant(e)", "Sage-femme", "Pharmacien(ne)", "Kinésithérapeute"] },
  { id: "education_formation", label: "Éducation & Formation", examples: ["Enseignant(e)", "Répétiteur(trice)/cours à domicile", "Éducateur(trice) petite enfance", "Formateur(trice)"] },
  { id: "securite", label: "Sécurité & Gardiennage", examples: ["Agent(e) de sécurité", "Vigile", "Maître-chien", "Agent(e) de surveillance"] },
  { id: "aide_domicile", label: "Aide à domicile & Services à la personne", examples: ["Aide-ménagère", "Nounou/garde d'enfants", "Jardinier(ère)", "Cuisinier(ère) à domicile", "Chauffeur(se) particulier(ère)"] },
  { id: "agriculture_elevage", label: "Agriculture & Élevage", examples: ["Ouvrier(ère) agricole", "Technicien(ne) agricole", "Éleveur(se)", "Pêcheur(se)"] },
  { id: "industrie_production", label: "Industrie & Production", examples: ["Opérateur(trice) de production", "Technicien(ne) de maintenance", "Contrôleur(euse) qualité", "Manutentionnaire"] },
  { id: "communication_marketing", label: "Communication, Marketing & Création", examples: ["Community manager", "Graphiste", "Photographe", "Monteur(se) vidéo", "Chargé(e) de marketing"] },
  { id: "juridique_administratif", label: "Juridique & Administratif", examples: ["Secrétaire", "Assistant(e) administratif(ve)", "Juriste", "Huissier", "Standardiste"] },
  { id: "immobilier", label: "Immobilier", examples: ["Agent(e) immobilier", "Gestionnaire de biens", "Démarcheur(se) immobilier"] },
  { id: "autre", label: "Autre / Divers", examples: [] },
];

export function jobSectorLabel(id?: string | null): string | undefined {
  return JOB_SECTORS.find((s) => s.id === id)?.label;
}

// Grille de critères standard — stockée dans le champ générique `specs` du
// listing (icon/label), au même titre que la grille "espace" existante.
// Icônes dédiées : voir CRITERIA_ICONS dans publish/page.tsx.
export const CONTRACT_TYPES = ["CDI", "CDD", "Stage / Apprentissage", "Journalier / Prestation ponctuelle", "Temps partiel"];
export const EXPERIENCE_LEVELS = ["Débutant accepté", "1 à 2 ans", "3 à 5 ans", "5 ans et plus"];
export const EDUCATION_LEVELS = ["Aucun diplôme requis", "CEPE / BEPC", "CAP / BT", "BAC", "BAC+2", "BAC+3 et plus"];
export const AVAILABILITY_OPTIONS = ["Immédiate", "Sous 15 jours", "À convenir"];
export const LANGUAGE_OPTIONS = ["Français", "Anglais", "Dioula", "Baoulé", "Autre langue locale"];
