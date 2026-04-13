export const colors = {
  // Existant — inchangé
  primary: "#1B3A6B",      // ← bleu institutionnel Niger (remplace #1E88E5)
  secondary: "#C9A84C",    // ← or République (remplace #1565C0)
  accent: "#2563EB",
  success: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
  background: "#FFFFFF",
  surface: "#F8FAFC",
  text: "#1E293B",
  textSecondary: "#64748B",
  black: "#000000",
  white: "#FFFFFF",
  transparent: "transparent",

  // Couleurs par rôle
  roles: {
    admin:           { bg: '#1E293B', text: '#FFFFFF', light: '#F1F5F9' },
    officier_police: { bg: '#1E3A8A', text: '#FFFFFF', light: '#DBEAFE' },
    commissaire:     { bg: '#1E3A8A', text: '#FFFFFF', light: '#DBEAFE' },
    inspecteur:      { bg: '#1E3A8A', text: '#FFFFFF', light: '#DBEAFE' },
    opj_gendarme:    { bg: '#065F46', text: '#FFFFFF', light: '#D1FAE5' },
    gendarme:        { bg: '#065F46', text: '#FFFFFF', light: '#D1FAE5' },
    prosecutor:      { bg: '#7C2D12', text: '#FFFFFF', light: '#FEF3C7' },
    judge:           { bg: '#7C2D12', text: '#FFFFFF', light: '#FEF3C7' },
    greffier:        { bg: '#7C2D12', text: '#FFFFFF', light: '#FEF3C7' },
    lawyer:          { bg: '#4338CA', text: '#FFFFFF', light: '#EEF2FF' },
    citizen:         { bg: '#0891B2', text: '#FFFFFF', light: '#E0F9FF' },
    prison_guard:    { bg: '#374151', text: '#FFFFFF', light: '#F3F4F6' },
    prison_director: { bg: '#374151', text: '#FFFFFF', light: '#F3F4F6' },
    police:          { bg: '#1E3A8A', text: '#FFFFFF', light: '#DBEAFE' },
  } as Record<string, { bg: string; text: string; light: string }>,

  // Couleurs de statut judiciaire
  status: {
    soumise:                          { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
    en_cours_OPJ:                     { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
    attente_validation:               { bg: '#FDE68A', text: '#78350F', dot: '#D97706' },
    transmise_parquet:                { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
    classée_sans_suite_par_OPJ:       { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
    classée_sans_suite_par_procureur: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
    figée:                            { bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' },
    prosecution_review:               { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
    instruction:                      { bg: '#EDE9FE', text: '#4C1D95', dot: '#8B5CF6' },
    trial:                            { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
    appeal:                           { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
    execution:                        { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
    archived:                         { bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' },
  } as Record<string, { bg: string; text: string; dot: string }>,

  // Labels lisibles pour les statuts
  statusLabels: {
    soumise:                          'Soumise',
    en_cours_OPJ:                     'En cours OPJ',
    attente_validation:               'Attente validation',
    transmise_parquet:                'Transmise parquet',
    classée_sans_suite_par_OPJ:       'Classée OPJ',
    classée_sans_suite_par_procureur: 'Classée parquet',
    figée:                            'Dossier ouvert',
    prosecution_review:               'Parquet',
    instruction:                      'Instruction',
    trial:                            'Jugement',
    appeal:                           'Appel',
    execution:                        'Exécution',
    archived:                         'Archivé',
  } as Record<string, string>,
};
