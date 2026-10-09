export type Locale = 'en' | 'es' | 'fr' | 'pt' | 'de';

export interface Translation {
  title: string;
  tagline: string;
  metaDescription: string;
  keywords: string;
  nav: {
    decks: string;
    mixer: string;
    playlist: string;
    support: string;
    supportTooltip: string;
    themeLight: string;
    themeDark: string;
    language: string;
  };
  hero: {
    badge: string;
    heading: string;
    subheading: string;
    ctaDemo: string;
    ctaUpload: string;
  };
  deck: {
    deckA: string;
    deckB: string;
    noTrack: string;
    loadTrackPrompt: string;
    play: string;
    pause: string;
    cue: string;
    sync: string;
    pitch: string;
    bpm: string;
    loop: string;
    loopExit: string;
    fourBeats: string;
    selectBeatFromDevice: string;
    fourBeatsActive: string;
    beatPadsTitle: string;
    beatPadTip: string;
    loadCustomBeat: string;
    stopAllPads: string;
    upNextTitle: string;
    noUpcomingTrack: string;
    loadNextNow: string;
    tempoRange: string;
    fineNudge: string;
    hotCues: string;
    high: string;
    mid: string;
    low: string;
    gain: string;
    volume: string;
    filter: string;
    reset: string;
    scratchTip: string;
    headphoneCue: string;
  };
  mixer: {
    title: string;
    masterVolume: string;
    crossfader: string;
    autoMix: string;
    autoMixActive: string;
    autoMixDescription: string;
    vuMeter: string;
    eqTitle: string;
    headphoneTitle: string;
    headphoneCue: string;
    cueDeckA: string;
    cueDeckB: string;
    headphoneMix: string;
    splitCue: string;
    splitCueDesc: string;
    headphoneVol: string;
  };
  playlist: {
    title: string;
    dropzoneText: string;
    dropzoneSubtext: string;
    browseFiles: string;
    browseFolder: string;
    decodingProgress: string;
    loadDemoTracks: string;
    loadToA: string;
    loadToB: string;
    queueNextA: string;
    queueNextB: string;
    queuedBadgeA: string;
    queuedBadgeB: string;
    queueSectionTitle: string;
    searchPlaceholder: string;
    tracksCount: string;
    noTracksFound: string;
    clearAll: string;
    privacyBadge: string;
    quickPreview: string;
    stopPreview: string;
  };
  fullscreen: {
    enter: string;
    exit: string;
    horizontalMode: string;
    portraitHint: string;
  };
  shortcuts: {
    title: string;
    deckA: string;
    deckB: string;
    playPause: string;
    cue: string;
    crossfaderLeft: string;
    crossfaderRight: string;
    autoMix: string;
  };
  seoFeatures: {
    title: string;
    zeroServerTitle: string;
    zeroServerDesc: string;
    audioEngineTitle: string;
    audioEngineDesc: string;
    autoMixTitle: string;
    autoMixDesc: string;
    proTouchTitle: string;
    proTouchDesc: string;
  };
  footer: {
    builtWith: string;
    developerCredit: string;
    supportCta: string;
    copyright: string;
    allRightsReserved: string;
  };
}

export const translations: Record<Locale, Translation> = {
  en: {
    title: 'BrowserDJ | Pro-Level Zero-Server Web DJ Controller',
    tagline: 'Professional 100% Client-Side DJ Mixer & Dual Decks',
    metaDescription: 'Free online DJ controller and browser DJ mixer with dual decks, 3-band EQ, master crossfader, and 5-second AutoMIX. 100% client-side zero-server audio processing.',
    keywords: 'free online dj controller, browser dj mixer, auto mix audio tool, client side dj board, web audio dj, virtual dj browser',
    nav: {
      decks: 'Decks',
      mixer: 'Mixer',
      playlist: 'Playlist',
      support: 'Support Developer',
      supportTooltip: 'Buy me a coffee & support BrowserDJ development',
      themeLight: 'Light Theme',
      themeDark: 'Dark Theme',
      language: 'Language',
    },
    hero: {
      badge: 'Zero-Server Client-Side Audio Engine',
      heading: 'Pro-Level Web DJ Controller in Your Browser',
      subheading: 'Dual real-time decks, 3-band studio EQ, smooth master crossfader, and algorithmic AutoMIX. Load your local MP3s and WAVs with zero server uploads.',
      ctaDemo: 'Load Instant Demo Tracks',
      ctaUpload: 'Load Local Audio Files',
    },
    deck: {
      deckA: 'DECK A',
      deckB: 'DECK B',
      noTrack: 'No Track Loaded',
      loadTrackPrompt: 'Select a track from the playlist below or drop an audio file here',
      play: 'PLAY',
      pause: 'PAUSE',
      cue: 'CUE',
      sync: 'SYNC',
      pitch: 'TEMPO / PITCH',
      bpm: 'BPM',
      loop: 'LOOP',
      loopExit: 'EXIT LOOP',
      fourBeats: '4 BEATS',
      selectBeatFromDevice: 'Select Beat from Device',
      fourBeatsActive: '4-BEAT LOOP ACTIVE',
      beatPadsTitle: '4-BEATS SAMPLER (PLAYS OVER SONG)',
      beatPadTip: 'Plays simultaneously with main track',
      loadCustomBeat: 'Load Beat from Device',
      stopAllPads: 'Stop Beats',
      upNextTitle: 'UP NEXT',
      noUpcomingTrack: 'None queued',
      loadNextNow: 'LOAD NEXT',
      tempoRange: 'RANGE',
      fineNudge: 'NUDGE',
      hotCues: 'HOT CUES',
      high: 'HI',
      mid: 'MID',
      low: 'LOW',
      gain: 'GAIN',
      volume: 'LEVEL',
      filter: 'FILTER',
      reset: 'RESET',
      scratchTip: 'Drag vinyl disc to scratch / scrub',
      headphoneCue: '🎧 CUE',
    },
    mixer: {
      title: 'MASTER MIXER',
      masterVolume: 'MASTER OUT',
      crossfader: 'CROSSFADER',
      autoMix: 'AUTOMIX (5s)',
      autoMixActive: 'TRANSITIONING...',
      autoMixDescription: 'Algorithmic 5-second smooth crossfade and auto-trigger',
      vuMeter: 'VU METERS',
      eqTitle: '3-BAND EQUALIZER',
      headphoneTitle: 'HEADPHONE CUE & MONITOR',
      headphoneCue: 'HEADPHONE CUE (PFL)',
      cueDeckA: 'CUE A',
      cueDeckB: 'CUE B',
      headphoneMix: 'CUE / MASTER MIX',
      splitCue: 'SPLIT CUE',
      splitCueDesc: 'Left: Master (Active) • Right: Cued Deck (Preview)',
      headphoneVol: 'PHONES VOL',
    },
    playlist: {
      title: 'LOCAL TRACK CRATE',
      dropzoneText: 'Drag & drop multiple MP3 / WAV / OGG / FLAC files here',
      dropzoneSubtext: 'Select single or multiple audio files, or an entire folder from your computer or phone',
      browseFiles: 'Choose Audio Files (Multiple)',
      browseFolder: 'Add Folder',
      decodingProgress: 'Decoding track',
      loadDemoTracks: 'Load Built-In Demo Beats',
      loadToA: 'LOAD [DECK A]',
      loadToB: 'LOAD [DECK B]',
      queueNextA: '+ NEXT A',
      queueNextB: '+ NEXT B',
      queuedBadgeA: 'NEXT ON A',
      queuedBadgeB: 'NEXT ON B',
      queueSectionTitle: 'UPCOMING QUEUE ORDER',
      searchPlaceholder: 'Search tracks by filename...',
      tracksCount: 'Tracks in Crate',
      noTracksFound: 'No tracks match your search.',
      clearAll: 'Clear Crate',
      privacyBadge: '100% In-Memory: No files are ever uploaded to any server',
      quickPreview: '🎧 Preview',
      stopPreview: '⏹ Stop Preview',
    },
    fullscreen: {
      enter: 'Full Screen DJ',
      exit: 'Exit Full Screen',
      horizontalMode: 'Landscape DJ Mode',
      portraitHint: 'Rotate device to landscape for full dual-deck controller layout',
    },
    shortcuts: {
      title: 'Keyboard Shortcuts',
      deckA: 'Deck A: Space = Play/Pause | C = Cue | Q = Sync | W/E = Pitch +/-',
      deckB: 'Deck B: Enter = Play/Pause | M = Cue | P = Sync | O/[ = Pitch +/-',
      playPause: 'Space / Enter',
      cue: 'C / M',
      crossfaderLeft: 'Left Arrow: Crossfade to Deck A',
      crossfaderRight: 'Right Arrow: Crossfade to Deck B',
      autoMix: 'X: Trigger 5s AutoMIX',
    },
    seoFeatures: {
      title: 'Why Choose BrowserDJ for Live Web Mixing?',
      zeroServerTitle: '100% Zero-Server Privacy',
      zeroServerDesc: 'Audio files are decoded directly in browser RAM via the HTML5 File API and Web Audio API. Zero bandwidth usage, zero server latency, zero cloud uploads.',
      audioEngineTitle: 'Studio-Grade Web Audio Architecture',
      audioEngineDesc: 'Ultra-low latency processing with BiquadFilterNode 3-band EQs (-30dB kill to +6dB boost), sample-rate pitch shifting, and high-resolution Canvas waveforms.',
      autoMixTitle: 'Algorithmic 5-Second AutoMIX',
      autoMixDesc: 'Seamlessly transition between active and incoming tracks with smooth cosine curve interpolation and auto-start sequencing.',
      proTouchTitle: 'Responsive & Touch Optimized',
      proTouchDesc: 'Engineered for laptops, iPads, tablets, and smartphones. Enjoy tactile vinyl scratching, oversized hit-targets, and an adaptive deck layout.',
    },
    footer: {
      builtWith: 'Engineered with Astro, React Islands & Web Audio API',
      developerCredit: 'Developed with passion for DJs worldwide',
      supportCta: 'Buy Me A Coffee',
      copyright: 'BrowserDJ',
      allRightsReserved: 'Open-source web DJ application. All audio processing runs locally in your browser.',
    },
  },
  es: {
    title: 'BrowserDJ | Controlador DJ Web Profesional Sin Servidor',
    tagline: 'Mezclador DJ Profesional 100% del Lado del Cliente',
    metaDescription: 'Controlador DJ en línea gratis y mezclador web con dos platos, ecualizador de 3 bandas, crossfader master y AutoMIX de 5 segundos. 100% en el navegador sin servidores.',
    keywords: 'controlador dj online gratis, mezclador dj navegador, herramienta auto mix audio, mesa dj cliente, web audio dj, virtual dj navegador',
    nav: {
      decks: 'Platos',
      mixer: 'Mezclador',
      playlist: 'Lista',
      support: 'Apoyar al Creador',
      supportTooltip: 'Cómprame un café y apoya el desarrollo de BrowserDJ',
      themeLight: 'Tema Claro',
      themeDark: 'Tema Oscuro',
      language: 'Idioma',
    },
    hero: {
      badge: 'Motor de Audio 100% en el Navegador',
      heading: 'Controlador DJ Profesional Directo en tu Navegador',
      subheading: 'Dos platos en tiempo real, EQ de 3 bandas, crossfader fluido y AutoMIX algorítmico. Carga tus pistas MP3 y WAV locales sin subirlas a ningún servidor.',
      ctaDemo: 'Cargar Pistas Demo',
      ctaUpload: 'Cargar Archivos de Audio',
    },
    deck: {
      deckA: 'PLATO A',
      deckB: 'PLATO B',
      noTrack: 'Ninguna pista cargada',
      loadTrackPrompt: 'Selecciona una pista de la lista o arrastra un archivo aquí',
      play: 'PLAY',
      pause: 'PAUSA',
      cue: 'CUE',
      sync: 'SYNC',
      pitch: 'TEMPO / PITCH',
      bpm: 'BPM',
      loop: 'LOOP',
      loopExit: 'SALIR LOOP',
      fourBeats: '4 BEATS',
      selectBeatFromDevice: 'Elegir Beat del Dispositivo',
      fourBeatsActive: 'LOOP DE 4 BEATS ACTIVO',
      beatPadsTitle: 'SAMPLER DE 4 BEATS (SUENA SOBRE LA CANCIÓN)',
      beatPadTip: 'Suena simultáneamente con la pista principal',
      loadCustomBeat: 'Cargar Beat del Dispositivo',
      stopAllPads: 'Detener Beats',
      upNextTitle: 'SIGUIENTE',
      noUpcomingTrack: 'Ninguno en cola',
      loadNextNow: 'CARGAR SIGUIENTE',
      tempoRange: 'RANGO',
      fineNudge: 'AJUSTE',
      hotCues: 'HOT CUES',
      high: 'AGUDOS',
      mid: 'MEDIOS',
      low: 'GRAVES',
      gain: 'GANANCIA',
      volume: 'NIVEL',
      filter: 'FILTRO',
      reset: 'REINICIAR',
      scratchTip: 'Arrastra el vinilo para hacer scratch',
      headphoneCue: '🎧 CUE',
    },
    mixer: {
      title: 'MEZCLADOR PRINCIPAL',
      masterVolume: 'SALIDA MASTER',
      crossfader: 'CROSSFADER',
      autoMix: 'AUTOMIX (5s)',
      autoMixActive: 'TRANSICIÓN...',
      autoMixDescription: 'Transición suave algorítmica de 5 segundos con inicio automático',
      vuMeter: 'VÚMETRO',
      eqTitle: 'ECUALIZADOR DE 3 BANDAS',
      headphoneTitle: 'MONITOR Y PRE-ESCUCHA',
      headphoneCue: 'PRE-ESCUCHA (PFL)',
      cueDeckA: 'CUE A',
      cueDeckB: 'CUE B',
      headphoneMix: 'MEZCLA CUE / MASTER',
      splitCue: 'SPLIT CUE',
      splitCueDesc: 'Izquierda: Master (Sala) • Derecha: Pre-escucha',
      headphoneVol: 'VOL. AURICULARES',
    },
    playlist: {
      title: 'BAÚL DE PISTAS LOCALES',
      dropzoneText: 'Arrastra y suelta múltiples archivos MP3 / WAV / OGG aquí',
      dropzoneSubtext: 'Selecciona varios archivos o una carpeta entera desde tu PC o teléfono',
      browseFiles: 'Elegir Canciones (Múltiples)',
      browseFolder: 'Añadir Carpeta',
      decodingProgress: 'Decodificando pista',
      loadDemoTracks: 'Cargar Beats de Demostración',
      loadToA: 'CARGAR [PLATO A]',
      loadToB: 'CARGAR [PLATO B]',
      queueNextA: '+ SIGUIENTE A',
      queueNextB: '+ SIGUIENTE B',
      queuedBadgeA: 'SIGUIENTE EN A',
      queuedBadgeB: 'SIGUIENTE EN B',
      queueSectionTitle: 'ORDEN DE PISTAS SIGUIENTES',
      searchPlaceholder: 'Buscar pistas...',
      tracksCount: 'Pistas en el Baúl',
      noTracksFound: 'No se encontraron pistas.',
      clearAll: 'Vaciar Baúl',
      privacyBadge: '100% en memoria: Ningún archivo se sube a internet',
      quickPreview: '🎧 Pre-escuchar',
      stopPreview: '⏹ Detener',
    },
    fullscreen: {
      enter: 'Pantalla Completa DJ',
      exit: 'Salir Pantalla Completa',
      horizontalMode: 'Modo Horizontal DJ',
      portraitHint: 'Gira tu dispositivo a horizontal para ver la mesa de mezclas completa',
    },
    shortcuts: {
      title: 'Atajos de Teclado',
      deckA: 'Plato A: Espacio = Play/Pausa | C = Cue | Q = Sync',
      deckB: 'Plato B: Enter = Play/Pausa | M = Cue | P = Sync',
      playPause: 'Espacio / Enter',
      cue: 'C / M',
      crossfaderLeft: 'Flecha Izquierda: Crossfade a Plato A',
      crossfaderRight: 'Flecha Derecha: Crossfade a Plato B',
      autoMix: 'X: Activar AutoMIX 5s',
    },
    seoFeatures: {
      title: '¿Por qué elegir BrowserDJ para tus sesiones web?',
      zeroServerTitle: '100% Privacidad Sin Servidor',
      zeroServerDesc: 'Los archivos se decodifican directamente en la RAM mediante la API Web Audio. Cero consumo de datos en la nube y latencia ultra baja.',
      audioEngineTitle: 'Arquitectura de Audio Profesional',
      audioEngineDesc: 'Procesamiento en tiempo real con filtros Biquad (-30dB a +6dB), pitch shifting continuo y ondas visualizadas en Canvas.',
      autoMixTitle: 'AutoMIX Algorítmico de 5 Segundos',
      autoMixDesc: 'Transiciones automáticas con curva de volumen óptima y arranque sincronizado de la pista entrante.',
      proTouchTitle: 'Optimizado para Móviles y Táctil',
      proTouchDesc: 'Diseñado para tablets y teléfonos móviles con botones de gran tamaño y scratching realista.',
    },
    footer: {
      builtWith: 'Desarrollado con Astro, React Islands y Web Audio API',
      developerCredit: 'Creado con pasión para la comunidad DJ global',
      supportCta: 'Invítame a un Café',
      copyright: 'BrowserDJ',
      allRightsReserved: 'Aplicación DJ de código abierto. Todo el procesamiento corre en tu navegador.',
    },
  },
  fr: {
    title: 'BrowserDJ | Contrôleur DJ Web Pro Zéro-Serveur',
    tagline: 'Mixeur DJ Professionnel 100% Côté Client',
    metaDescription: 'Contrôleur DJ gratuit en ligne avec deux platines, égaliseur 3 bandes, crossfader master et AutoMIX de 5 secondes. Traitement audio 100% dans votre navigateur sans serveur.',
    keywords: 'controleur dj gratuit en ligne, table de mixage dj navigateur, auto mix audio, platine dj client, web audio dj, virtual dj navigateur',
    nav: {
      decks: 'Platines',
      mixer: 'Mixeur',
      playlist: 'Playlist',
      support: 'Soutenir le Dev',
      supportTooltip: 'Offrez-moi un café pour soutenir BrowserDJ',
      themeLight: 'Thème Clair',
      themeDark: 'Thème Sombre',
      language: 'Langue',
    },
    hero: {
      badge: 'Moteur Audio 100% Navigateur',
      heading: 'Contrôleur DJ Pro Directement dans votre Navigateur',
      subheading: 'Deux platines en temps réel, égaliseur 3 bandes studio, crossfader fluide et AutoMIX algorithmique. Chargez vos MP3 et WAV sans aucun transfert de fichier.',
      ctaDemo: 'Charger les Morceaux Démo',
      ctaUpload: 'Charger Fichiers Audio',
    },
    deck: {
      deckA: 'PLATINE A',
      deckB: 'PLATINE B',
      noTrack: 'Aucun morceau chargé',
      loadTrackPrompt: 'Choisissez un morceau dans la liste ou déposez un fichier ici',
      play: 'PLAY',
      pause: 'PAUSE',
      cue: 'CUE',
      sync: 'SYNC',
      pitch: 'TEMPO / PITCH',
      bpm: 'BPM',
      loop: 'BOUCLE',
      loopExit: 'SORTIR BOUCLE',
      fourBeats: '4 BEATS',
      selectBeatFromDevice: 'Sélectionner Beat sur l’Appareil',
      fourBeatsActive: 'BOUCLE 4 BEATS ACTIVE',
      beatPadsTitle: 'SAMPLER 4 BEATS (JOUE PAR-DESSUS LE MORCEAU)',
      beatPadTip: 'Joue simultanément avec le morceau principal',
      loadCustomBeat: 'Charger Beat de l’Appareil',
      stopAllPads: 'Arrêter Beats',
      upNextTitle: 'À SUIVRE',
      noUpcomingTrack: 'Aucun en file',
      loadNextNow: 'CHARGER SUIVANT',
      tempoRange: 'PLAGE',
      fineNudge: 'AJUSTEMENT',
      hotCues: 'HOT CUES',
      high: 'AIGUS',
      mid: 'MÉDIUMS',
      low: 'BASSES',
      gain: 'GAIN',
      volume: 'NIVEAU',
      filter: 'FILTRE',
      reset: 'RÉINITIALISER',
      scratchTip: 'Faites glisser le disque vinyle pour scratcher',
      headphoneCue: '🎧 CUE',
    },
    mixer: {
      title: 'CONSOLE DE MIXAGE',
      masterVolume: 'SORTIE MASTER',
      crossfader: 'CROSSFADER',
      autoMix: 'AUTOMIX (5s)',
      autoMixActive: 'TRANSITION...',
      autoMixDescription: 'Fondu enchaîné algorithmique fluide de 5 secondes avec lecture auto',
      vuMeter: 'VU-MÈTRE',
      eqTitle: 'ÉGALISEUR 3 BANDES',
      headphoneTitle: 'MONITORING CASQUE (PFL)',
      headphoneCue: 'PRÉ-ÉCOUTE CASQUE',
      cueDeckA: 'CUE A',
      cueDeckB: 'CUE B',
      headphoneMix: 'MIX CUE / MASTER',
      splitCue: 'SPLIT CUE',
      splitCueDesc: 'Oreille Gauche: Master • Oreille Droite: Platine CUE',
      headphoneVol: 'VOL. CASQUE',
    },
    playlist: {
      title: 'BAC DE MORCEAUX LOCAUX',
      dropzoneText: 'Glissez-déposez plusieurs fichiers MP3 / WAV / OGG ici',
      dropzoneSubtext: 'Sélectionnez plusieurs morceaux ou un dossier complet',
      browseFiles: 'Choisir des Morceaux (Multiples)',
      browseFolder: 'Ajouter Dossier',
      decodingProgress: 'Décodage du morceau',
      loadDemoTracks: 'Charger Beats Démo',
      loadToA: 'CHARGER [PLATINE A]',
      loadToB: 'CHARGER [PLATINE B]',
      queueNextA: '+ SUIVANT A',
      queueNextB: '+ SUIVANT B',
      queuedBadgeA: 'SUIVANT SUR A',
      queuedBadgeB: 'SUIVANT SUR B',
      queueSectionTitle: 'ORDRE DES PISTES SUIVANTES',
      searchPlaceholder: 'Rechercher des morceaux...',
      tracksCount: 'Morceaux dans le Bac',
      noTracksFound: 'Aucun morceau trouvé.',
      clearAll: 'Vider le Bac',
      privacyBadge: '100% Mémoire Locale : Aucun fichier envoyé sur un serveur',
      quickPreview: '🎧 Pré-écoute',
      stopPreview: '⏹ Arrêter',
    },
    fullscreen: {
      enter: 'Plein Écran DJ',
      exit: 'Quitter Plein Écran',
      horizontalMode: 'Mode Horizontal DJ',
      portraitHint: 'Basculez votre appareil en paysage pour la disposition complète',
    },
    shortcuts: {
      title: 'Raccourcis Clavier',
      deckA: 'Platine A : Espace = Lecture/Pause | C = Cue | Q = Sync',
      deckB: 'Platine B : Entrée = Lecture/Pause | M = Cue | P = Sync',
      playPause: 'Espace / Entrée',
      cue: 'C / M',
      crossfaderLeft: 'Flèche Gauche : Fondu vers Platine A',
      crossfaderRight: 'Flèche Droite : Fondu vers Platine B',
      autoMix: 'X : Déclencher AutoMIX 5s',
    },
    seoFeatures: {
      title: 'Pourquoi choisir BrowserDJ pour mixer en direct ?',
      zeroServerTitle: '100% Confidentialité Zéro Serveur',
      zeroServerDesc: 'Les fichiers sont décodés directement dans la RAM du navigateur. Zéro upload vers le cloud, zéro latence serveur.',
      audioEngineTitle: 'Architecture Web Audio Studio',
      audioEngineDesc: 'Filtres BiquadNode 3 bandes (-30dB à +6dB), modification de pitch ultra fluide et formes d’onde haute précision.',
      autoMixTitle: 'AutoMIX Algorithmique 5s',
      autoMixDesc: 'Transition automatique fluide entre les pistes avec courbe de volume calculée et déclenchement instantané.',
      proTouchTitle: 'Optimisé pour le Tactile & Mobile',
      proTouchDesc: 'Zones tactiles élargies pour smartphones et tablettes avec scratch vinyle réactif.',
    },
    footer: {
      builtWith: 'Conçu avec Astro, React Islands & Web Audio API',
      developerCredit: 'Développé pour les passionnés de mixage',
      supportCta: 'Offrir un Café',
      copyright: 'BrowserDJ',
      allRightsReserved: 'Application DJ web open-source. Tout le traitement tourne localement.',
    },
  },
  pt: {
    title: 'BrowserDJ | Controlador DJ Web Profissional Zero-Servidor',
    tagline: 'Mixer DJ Profissional 100% no Lado do Cliente',
    metaDescription: 'Controlador DJ online gratuito com dois decks, EQ de 3 bandas, crossfader master e AutoMIX de 5 segundos. 100% no navegador sem servidores.',
    keywords: 'controlador dj online gratis, mixer dj navegador, ferramenta auto mix audio, mesa dj cliente, web audio dj, virtual dj navegador',
    nav: {
      decks: 'Decks',
      mixer: 'Mixer',
      playlist: 'Playlist',
      support: 'Apoiar o Dev',
      supportTooltip: 'Pague um café e apoie o desenvolvimento do BrowserDJ',
      themeLight: 'Tema Claro',
      themeDark: 'Tema Escuro',
      language: 'Idioma',
    },
    hero: {
      badge: 'Motor de Áudio 100% no Navegador',
      heading: 'Controlador DJ Profissional Direto no seu Navegador',
      subheading: 'Dois decks em tempo real, EQ de 3 bandas de estúdio, crossfader suave e AutoMIX algorítmico. Carregue MP3 e WAV sem uploads para servidores.',
      ctaDemo: 'Carregar Músicas Demo',
      ctaUpload: 'Carregar Arquivos de Áudio',
    },
    deck: {
      deckA: 'DECK A',
      deckB: 'DECK B',
      noTrack: 'Nenhuma faixa carregada',
      loadTrackPrompt: 'Selecione uma faixa da lista ou arraste um arquivo aqui',
      play: 'PLAY',
      pause: 'PAUSA',
      cue: 'CUE',
      sync: 'SYNC',
      pitch: 'TEMPO / PITCH',
      bpm: 'BPM',
      loop: 'LOOP',
      loopExit: 'SAIR DO LOOP',
      fourBeats: '4 BEATS',
      selectBeatFromDevice: 'Selecionar Beat do Dispositivo',
      fourBeatsActive: 'LOOP DE 4 BEATS ATIVO',
      beatPadsTitle: 'SAMPLER DE 4 BEATS (TOCA SOBRE A MÚSICA)',
      beatPadTip: 'Toca simultaneamente com a faixa principal',
      loadCustomBeat: 'Carregar Beat do Dispositivo',
      stopAllPads: 'Parar Beats',
      upNextTitle: 'A SEGUIR',
      noUpcomingTrack: 'Nenhuma na fila',
      loadNextNow: 'CARREGAR PRÓXIMA',
      tempoRange: 'FAIXA',
      fineNudge: 'AJUSTE',
      hotCues: 'HOT CUES',
      high: 'AGUDOS',
      mid: 'MÉDIOS',
      low: 'GRAVES',
      gain: 'GANHO',
      volume: 'NÍVEL',
      filter: 'FILTRO',
      reset: 'REDEFINIR',
      scratchTip: 'Arraste o disco de vinil para fazer scratch',
      headphoneCue: '🎧 CUE',
    },
    mixer: {
      title: 'MIXER PRINCIPAL',
      masterVolume: 'SAÍDA MASTER',
      crossfader: 'CROSSFADER',
      autoMix: 'AUTOMIX (5s)',
      autoMixActive: 'TRANSIÇÃO...',
      autoMixDescription: 'Transição suave algorítmica de 5 segundos com reprodução automática',
      vuMeter: 'MEDIDOR VU',
      eqTitle: 'EQUALIZADOR DE 3 BANDAS',
      headphoneTitle: 'MONITORAMENTO DE FONES (PFL)',
      headphoneCue: 'PRÉ-ESCUTA NOS FONES',
      cueDeckA: 'CUE A',
      cueDeckB: 'CUE B',
      headphoneMix: 'MIX CUE / MASTER',
      splitCue: 'SPLIT CUE',
      splitCueDesc: 'Ouvido Esq: Master • Ouvido Dir: Deck CUE',
      headphoneVol: 'VOL. FONES',
    },
    playlist: {
      title: 'BAÚ DE FAIXAS LOCAIS',
      dropzoneText: 'Arraste e solte múltiplos arquivos MP3 / WAV / OGG aqui',
      dropzoneSubtext: 'Selecione várias faixas ou uma pasta completa do seu dispositivo',
      browseFiles: 'Escolher Músicas (Múltiplas)',
      browseFolder: 'Adicionar Pasta',
      decodingProgress: 'Decodificando faixa',
      loadDemoTracks: 'Carregar Beats de Demonstração',
      loadToA: 'CARREGAR [DECK A]',
      loadToB: 'CARREGAR [DECK B]',
      queueNextA: '+ PRÓXIMA A',
      queueNextB: '+ PRÓXIMA B',
      queuedBadgeA: 'PRÓXIMA NO A',
      queuedBadgeB: 'PRÓXIMA NO B',
      queueSectionTitle: 'ORDEM DAS PRÓXIMAS FAIXAS',
      searchPlaceholder: 'Buscar faixas...',
      tracksCount: 'Faixas no Baú',
      noTracksFound: 'Nenhuma faixa encontrada.',
      clearAll: 'Limpar Baú',
      privacyBadge: '100% em Memória: Nenhum arquivo é enviado a servidores',
      quickPreview: '🎧 Pré-escutar',
      stopPreview: '⏹ Parar',
    },
    fullscreen: {
      enter: 'Tela Cheia DJ',
      exit: 'Sair de Tela Cheia',
      horizontalMode: 'Modo Horizontal DJ',
      portraitHint: 'Gire o dispositivo para a horizontal para ver o controlador completo',
    },
    shortcuts: {
      title: 'Atalhos de Teclado',
      deckA: 'Deck A: Espaço = Play/Pausa | C = Cue | Q = Sync',
      deckB: 'Deck B: Enter = Play/Pausa | M = Cue | P = Sync',
      playPause: 'Espaço / Enter',
      cue: 'C / M',
      crossfaderLeft: 'Seta Esquerda: Crossfade para Deck A',
      crossfaderRight: 'Seta Direita: Crossfade para Deck B',
      autoMix: 'X: Disparar AutoMIX 5s',
    },
    seoFeatures: {
      title: 'Por que escolher o BrowserDJ para discotecar no navegador?',
      zeroServerTitle: '100% Privacidade Sem Servidores',
      zeroServerDesc: 'Decodificação direta na RAM via Web Audio API. Zero consumo de upload na nuvem e resposta instantânea.',
      audioEngineTitle: 'Arquitetura de Áudio de Estúdio',
      audioEngineDesc: 'Filtros Biquad de 3 bandas (-30dB a +6dB), ajuste contínuo de tom e formas de onda em Canvas de alta performance.',
      autoMixTitle: 'AutoMIX Algorítmico de 5 Segundos',
      autoMixDesc: 'Transição harmônica entre faixas com curva calculada e disparo sincronizado da próxima faixa.',
      proTouchTitle: 'Otimizado para Telas de Toque',
      proTouchDesc: 'Controles gigantes para tablets e smartphones com scratch analógico responsivo.',
    },
    footer: {
      builtWith: 'Criado com Astro, React Islands e Web Audio API',
      developerCredit: 'Desenvolvido com carinho para DJs do mundo inteiro',
      supportCta: 'Pagar um Café',
      copyright: 'BrowserDJ',
      allRightsReserved: 'Aplicativo DJ open-source. Todo o processamento é executado localmente.',
    },
  },
  de: {
    title: 'BrowserDJ | Professioneller Zero-Server Web-DJ-Controller',
    tagline: 'Professioneller 100% Client-Side DJ-Mixer & Dual Decks',
    metaDescription: 'Kostenloser Online-DJ-Controller und Browser-DJ-Mixer mit zwei Decks, 3-Band-EQ, Master-Crossfader und 5-Sekunden-AutoMIX. 100% clientseitige Audioverarbeitung ohne Server.',
    keywords: 'kostenloser online dj controller, browser dj mixer, auto mix audio tool, client side dj board, web audio dj, virtual dj browser',
    nav: {
      decks: 'Decks',
      mixer: 'Mixer',
      playlist: 'Playlist',
      support: 'Entwickler unterstützen',
      supportTooltip: 'Kaufe mir einen Kaffee und unterstütze BrowserDJ',
      themeLight: 'Heller Modus',
      themeDark: 'Dunkler Modus',
      language: 'Sprache',
    },
    hero: {
      badge: 'Zero-Server Client-Side Audio-Engine',
      heading: 'Profi-DJ-Controller direkt im Browser',
      subheading: 'Zwei Echtzeit-Decks, 3-Band-Studio-EQ, geschmeidiger Master-Crossfader und algorithmischer AutoMIX. Lade lokale MP3s und WAVs ganz ohne Server-Upload.',
      ctaDemo: 'Demo-Tracks laden',
      ctaUpload: 'Audiodateien laden',
    },
    deck: {
      deckA: 'DECK A',
      deckB: 'DECK B',
      noTrack: 'Kein Track geladen',
      loadTrackPrompt: 'Wähle einen Track aus der Playlist oder ziehe eine Datei hierher',
      play: 'PLAY',
      pause: 'PAUSE',
      cue: 'CUE',
      sync: 'SYNC',
      pitch: 'TEMPO / PITCH',
      bpm: 'BPM',
      loop: 'LOOP',
      loopExit: 'LOOP VERLASSEN',
      fourBeats: '4 BEATS',
      selectBeatFromDevice: 'Beat vom Gerät wählen',
      fourBeatsActive: '4-BEAT-LOOP AKTIV',
      beatPadsTitle: '4-BEATS SAMPLER (LÄUFT ÜBER DEM TRACK)',
      beatPadTip: 'Spielt gleichzeitig mit dem Haupttrack',
      loadCustomBeat: 'Beat vom Gerät laden',
      stopAllPads: 'Beats stoppen',
      upNextTitle: 'ALS NÄCHSTES',
      noUpcomingTrack: 'Keiner in der Warteschlange',
      loadNextNow: 'NÄCHSTEN LADEN',
      tempoRange: 'BEREICH',
      fineNudge: 'FEINJUSTIERUNG',
      hotCues: 'HOT CUES',
      high: 'HÖHEN',
      mid: 'MITTEN',
      low: 'BÄSSE',
      gain: 'GAIN',
      volume: 'PEGEL',
      filter: 'FILTER',
      reset: 'ZURÜCKSETZEN',
      scratchTip: 'Plattenteller ziehen zum Scratchen',
      headphoneCue: '🎧 CUE',
    },
    mixer: {
      title: 'MASTER-MIXER',
      masterVolume: 'MASTER-AUSGANG',
      crossfader: 'CROSSFADER',
      autoMix: 'AUTOMIX (5s)',
      autoMixActive: 'ÜBERGANG LÄUFT...',
      autoMixDescription: 'Algorithmische 5-Sekunden-Überblendung mit automatischem Start',
      vuMeter: 'VU-METER',
      eqTitle: '3-BAND-EQUALIZER',
      headphoneTitle: 'KOPFHÖRER-MONITOR (VORHÖREN)',
      headphoneCue: 'VORHÖREN (PFL)',
      cueDeckA: 'CUE A',
      cueDeckB: 'CUE B',
      headphoneMix: 'CUE / MASTER MIX',
      splitCue: 'SPLIT CUE',
      splitCueDesc: 'Linkes Ohr: Master (Saal) • Rechtes Ohr: Vorhör-Deck',
      headphoneVol: 'KOPFHÖRER PEGEL',
    },
    playlist: {
      title: 'LOKALE TRACK-CRATE',
      dropzoneText: 'Mehrere MP3- / WAV- / OGG-Dateien hier ablegen',
      dropzoneSubtext: 'Wähle mehrere Tracks oder einen ganzen Ordner von deinem PC oder Smartphone',
      browseFiles: 'Tracks auswählen (Mehrfachauswahl)',
      browseFolder: 'Ordner hinzufügen',
      decodingProgress: 'Track wird decodiert',
      loadDemoTracks: 'Integrierte Demo-Beats laden',
      loadToA: 'LADEN [DECK A]',
      loadToB: 'LADEN [DECK B]',
      queueNextA: '+ NÄCHSTER A',
      queueNextB: '+ NÄCHSTER B',
      queuedBadgeA: 'NÄCHSTER AUF A',
      queuedBadgeB: 'NÄCHSTER AUF B',
      queueSectionTitle: 'REIHENFOLGE DER NÄCHSTEN TRACKS',
      searchPlaceholder: 'Tracks durchsuchen...',
      tracksCount: 'Tracks in der Crate',
      noTracksFound: 'Keine passenden Tracks gefunden.',
      clearAll: 'Crate leeren',
      privacyBadge: '100% im Arbeitsspeicher: Es werden keine Dateien ins Internet hochgeladen',
      quickPreview: '🎧 Vorhören',
      stopPreview: '⏹ Stoppen',
    },
    fullscreen: {
      enter: 'Vollbild DJ',
      exit: 'Vollbild beenden',
      horizontalMode: 'Querformat DJ-Modus',
      portraitHint: 'Gerät ins Querformat drehen für die vollständige Dual-Deck-Ansicht',
    },
    shortcuts: {
      title: 'Tastatur-Kürzel',
      deckA: 'Deck A: Leertaste = Play/Pause | C = Cue | Q = Sync',
      deckB: 'Deck B: Enter = Play/Pause | M = Cue | P = Sync',
      playPause: 'Leertaste / Enter',
      cue: 'C / M',
      crossfaderLeft: 'Pfeiltaste links: Überblenden zu Deck A',
      crossfaderRight: 'Pfeiltaste rechts: Überblenden zu Deck B',
      autoMix: 'X: 5s AutoMIX auslösen',
    },
    seoFeatures: {
      title: 'Warum BrowserDJ für Live-Sets im Web?',
      zeroServerTitle: '100% Zero-Server Datenschutz',
      zeroServerDesc: 'Audiodateien werden direkt im RAM dekodiert. Null Cloud-Uploads, keine Datenübertragung, null Latenz.',
      audioEngineTitle: 'Studio-Reife Web-Audio-Architektur',
      audioEngineDesc: 'Echtzeitverarbeitung mit Biquad-Filtern (-30dB bis +6dB), Tonhöhenanpassung und hochauflösenden Canvas-Wellenformen.',
      autoMixTitle: 'Algorithmischer 5-Sekunden AutoMIX',
      autoMixDesc: 'Nahtlose automatische Überblendung mit sanfter Cosinus-Kurve und automatischem Track-Start.',
      proTouchTitle: 'Touch- & Mobil-Optimiert',
      proTouchDesc: 'Für Laptops, Tablets und Smartphones mit großen Touch-Zielen und reaktionsschnellem Vinyl-Scratching.',
    },
    footer: {
      builtWith: 'Erstellt mit Astro, React Islands & Web Audio API',
      developerCredit: 'Entwickelt für DJs weltweit',
      supportCta: 'Kaffee spendieren',
      copyright: 'BrowserDJ',
      allRightsReserved: 'Open-Source Web-DJ-Anwendung. Gesamte Audioverarbeitung läuft lokal im Browser.',
    },
  },
};
