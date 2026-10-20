/* =====================================================================
   CogNeurdle term bank — PSY 4480 Cognitive Neuroscience (Cal Poly)
   =====================================================================
   HOW TO ADD CONTENT
   - Each term is one object in `terms`. Copy any entry as a template.
   - `clues` must have exactly 5 strings, hardest first:
       1 expert-level (history, etymology, a detail beyond lecture)
       2 technical property
       3 key fact from lecture
       4 contrast with the nearest sibling term
       5 near-definition / study-guide phrasing
   - `aliases` are other accepted answers (case, accents and punctuation
     are ignored automatically; small typos are tolerated). Don't list
     the answer itself.
   - `cat` must be a key of `categories`; `unit` a key of `units`.
   - A unit's optional `short` label (one word) is shown under its button
     in the endless-mode lecture filter.
   - To put a new unit in play, set `released: true` (it is then in the
     endless pool and the unit filter immediately) and give it a
     `dailyFrom: 'YYYY-MM-DD'` date: from that day the daily puzzle cycles
     through the new unit's terms first, then everything released. Days
     before that date keep the schedule they already had, so never change
     `dailyFrom` once a unit is live. (Units with no `dailyFrom` count as
     live since the epoch.)
   - `id` must be unique and never change once students have played
     (it is what the daily schedule and local stats key on).
   - `lab` (optional) links the learn card to a Brain Lab page.
   ===================================================================== */
window.COGNEURDLE = {
  version: 5,
  epoch: '2026-09-04',            // date of CogNeurdle #1 (local time)
  units: {
    L1: { name: 'Lecture 1 · Intro & neuroanatomy', short: 'Anatomy',   released: true },
    L2: { name: 'Lecture 2 · Methods',              short: 'Methods',   released: true },
    L3: { name: 'Lecture 3 · Neural decoding',      short: 'Decoding',  released: true },
    L4: { name: 'Lecture 4 · Attention',            short: 'Attention', released: true, dailyFrom: '2026-09-17' },
    L5: { name: 'Lecture 5 · Memory',               short: 'Memory',    released: true, dailyFrom: '2026-10-02' },
    L6: { name: 'Lecture 6 · Language',             short: 'Language',  released: true, dailyFrom: '2026-10-02' },
    L7: { name: 'Lecture 7 · Connectivity',         short: 'Networks',  released: true, dailyFrom: '2026-10-20' },
    L8: { name: 'Lecture 8 · High-level perception', short: 'Perception', released: true, dailyFrom: '2026-10-20' },
    L9: { name: 'Lecture 9 · Brain stimulation',    short: 'Brain stim', released: true, dailyFrom: '2026-10-20' },
  },
  categories: {
    history:     'People & history',
    neuron:      'Neurons & signaling',
    anatomy:     'Neuroanatomy',
    orientation: 'Orientation & planes',
    lesion:      'Brain damage & dissociations',
    methods:     'Methods',
    decoding:    'fMRI & decoding',
    attention:   'Attention',
    memory:      'Memory',
    language:    'Language',
    vision:      'Vision & perception',
    connectivity:'Connectivity & networks',
  },
  terms: [
  /* ---------------------------- LECTURE 1 ---------------------------- */
  { id:'phrenology', answer:'Phrenology', aliases:[], cat:'history', unit:'L1', source:'Lecture 1 study guide',
    clues:[
      'Flourens\'s ablation experiments on pigeons in the 1820s were designed specifically to refute it, and for the next forty years his "aggregate field" view was taken to have won.',
      'Its practitioners assumed the skull faithfully followed the shape of the organ beneath it, so the surface of the head could be read like a map.',
      'It proposed some 27 or more mental "faculties," from amativeness to veneration, each with a fixed location in the brain.',
      'It was wrong about the skull and wrong about the faculties, but its core intuition, that different brain regions do different things, survives as localization of function.',
      'The 19th-century pseudoscience of reading personality from the bumps on a person\'s head.'],
    learn:'A 19th-century theory (Gall, Spurzheim) claiming that mental faculties are localized in specific brain "organs" whose size could be read from bumps on the skull. Discredited, but historically important as an early statement of localization of function.' },

  { id:'penfield', answer:'Wilder Penfield', aliases:['Penfield'], cat:'history', unit:'L1', source:'Lecture 1 study guide', lab:'Cortex_Explorer.html',
    clues:[
      'He trained under Sherrington at Oxford and founded the Montreal Neurological Institute in 1934.',
      'His patients were awake during surgery, under local anesthetic only, which is why they could report what they felt.',
      'He was mapping cortex to find the source of epileptic seizures; the famous map was a by-product of trying to spare healthy tissue.',
      'Broca inferred function from damage; this man inferred it directly, by electrically stimulating the exposed cortex of living patients.',
      'The neurosurgeon whose electrical stimulation of the cortex in awake patients produced the sensory and motor "homunculus" maps.'],
    learn:'Canadian neurosurgeon (1891–1976) who, while operating on awake epilepsy patients, stimulated the cortical surface with an electrode and recorded what patients felt or did. This produced the somatotopic maps of motor and somatosensory cortex (the homunculus) and showed that different cortical regions have different functions.' },

  { id:'cajal', answer:'Santiago Ramón y Cajal', aliases:['Cajal','Ramon y Cajal','Santiago Cajal','Ramon Cajal'], cat:'history', unit:'L1', source:'Lecture 1 study guide',
    clues:[
      'He published his early findings in a journal he founded and paid for himself, the Revista Trimestral de Histología Normal y Patológica, because almost nobody outside Spain read Spanish.',
      'He shared the 1906 Nobel Prize with the man whose technique he used, though the two disagreed bitterly, in their Nobel lectures, about what the technique showed.',
      'He refined a silver staining method so that only a few cells at a time were blackened in their entirety, which let him see single cells clearly.',
      'Where Golgi saw a continuous net (a reticulum), he saw separate cells that touched without fusing.',
      'The Spanish neuroanatomist whose drawings of stained neurons established that the nervous system is made of discrete cells: the neuron doctrine.'],
    learn:'Spanish neuroanatomist (1852–1934). Using an improved Golgi stain, he showed that neurons are separate cells that contact but do not fuse, establishing the neuron doctrine. He also proposed that signals flow in one direction (dendrite to axon). Nobel Prize 1906, shared with Golgi.' },

  { id:'neuron_doctrine', answer:'Neuron doctrine', aliases:['neuron theory','the neuron doctrine'], cat:'history', unit:'L1', source:'Lecture 1 study guide',
    clues:[
      'His\'s embryological observation that nerve fibers grow out from single cells, and Forel\'s degeneration studies, were its two main lines of evidence before the decisive histology arrived.',
      'One of its tenets, the law of dynamic polarization, says signals flow one way through a cell: dendrites in, axon out.',
      'Its rival, reticular theory, held that nerve cells fuse into one continuous network.',
      'Electron microscopy in the 1950s finally settled it by showing a gap of a few tens of nanometers where cells meet.',
      'The principle that the nervous system is built from individual, discrete cells that communicate across gaps rather than forming a continuous net; Cajal\'s central claim.'],
    learn:'The principle that the nervous system is made of discrete cells (neurons) that are structurally, functionally and developmentally independent, communicating across synapses. Established by Cajal against Golgi\'s reticular theory; confirmed by electron microscopy in the 1950s.' },

  { id:'golgi_stain', answer:'Golgi stain', aliases:['Golgi staining','Golgi method','the Golgi stain','silver stain','Golgi\'s stain','Golgi technique'], cat:'history', unit:'L1', source:'Lecture 1 study guide',
    clues:[
      'Its inventor called it "la reazione nera," the black reaction, and discovered it in 1873 in a hospital kitchen he had turned into a laboratory.',
      'It impregnates tissue with silver chromate, and to this day nobody fully understands why it stains only a small fraction of cells.',
      'Because it stains only about 1–5% of neurons, each stained cell appears complete and alone against a clear background, dendrites and axon included.',
      'A Nissl stain marks every cell body; this method reveals the entire shape of a small random sample of neurons.',
      'The silver-based staining method Cajal used to see individual neurons in their entirety, making the neuron doctrine possible.'],
    learn:'A silver-chromate staining method (Camillo Golgi, 1873) that stains a small random subset of neurons completely, in black, so their full shape can be seen. Cajal used it to show that neurons are separate cells.' },

  { id:'axon', answer:'Axon', aliases:['axons','nerve fiber'], cat:'neuron', unit:'L1', source:'Lecture 1 study guide', lab:'Action_Potential_Explorer.html',
    clues:[
      'Its initial segment is marked by a dense ankyrin-G scaffold that clusters voltage-gated sodium channels at up to fifty times the density of the surrounding membrane.',
      'A neuron has exactly one of these (though it may branch), and it emerges from a cone-shaped region called the hillock.',
      'In many neurons it is wrapped in myelin, with small gaps (nodes of Ranvier) where the signal is regenerated.',
      'Dendrites carry signals toward the cell body; this carries the signal away from it.',
      'The long, thin output fiber of a neuron that conducts action potentials from the cell body to the presynaptic terminals.'],
    learn:'The single output fiber of a neuron. Action potentials are generated at the axon hillock and travel along the axon (often myelinated) to presynaptic terminals, where neurotransmitter is released.' },

  { id:'dendrite', answer:'Dendrite', aliases:['dendrites'], cat:'neuron', unit:'L1', source:'Lecture 1 study guide', lab:'Action_Potential_Explorer.html',
    clues:[
      'Rall\'s cable theory of the 1960s showed how to collapse its entire branching tree into a single equivalent cylinder, provided the branch diameters obey a 3/2-power rule at every fork.',
      'Its membrane is studded with receptors and, in many cortical neurons, with thousands of tiny protrusions.',
      'A single cortical pyramidal neuron may carry several millimeters of these in total, all packed within a fraction of a cubic millimeter.',
      'The axon is a neuron\'s single output; these are its many inputs.',
      'The branching extensions of a neuron that receive synaptic input from other neurons and carry it toward the cell body.'],
    learn:'Branching input extensions of a neuron. Their membranes carry the receptors that neurotransmitters bind to, so most synaptic input arrives on dendrites (often on dendritic spines).' },

  { id:'synapse', answer:'Synapse', aliases:['synapses'], cat:'neuron', unit:'L1', source:'Lecture 1 study guide', lab:'Action_Potential_Explorer.html',
    clues:[
      'Sherrington coined the word in 1897, from the Greek for "to clasp together," before anyone had seen one.',
      'The gap at its center is about 20–40 nanometers, far too small for a light microscope, which is why the neuron doctrine stayed controversial for decades.',
      'Electrical ones exist (gap junctions), but the great majority in the human brain are chemical.',
      'The action potential is an electrical signal; at this point the signal is usually converted into a chemical one.',
      'The junction where one neuron communicates with another, typically by releasing neurotransmitter from a presynaptic terminal onto a postsynaptic cell.'],
    learn:'The junction between two neurons: a presynaptic terminal, a narrow cleft, and a postsynaptic membrane. In a chemical synapse, an arriving action potential triggers neurotransmitter release; the transmitter binds receptors on the postsynaptic cell and produces a postsynaptic potential.' },

  { id:'dendritic_spine', answer:'Dendritic spine', aliases:['spine','spines','dendritic spines'], cat:'neuron', unit:'L1', source:'Lecture 1 study guide',
    clues:[
      'Cajal first drew them in 1888 and insisted they were real; many contemporaries dismissed them as artifacts of the stain.',
      'They come in shapes named thin, stubby and mushroom, and can appear or vanish within hours during learning.',
      'A single cortical pyramidal neuron carries on the order of ten thousand of them.',
      'The presynaptic terminal is on the sending neuron\'s axon; this is its usual partner on the receiving neuron.',
      'The tiny knob-like protrusion on a dendrite that receives a single excitatory synapse.'],
    learn:'A small protrusion on a dendrite that forms the postsynaptic side of (usually) one excitatory synapse. Spines are plastic: they change shape, appear and disappear with experience.' },

  { id:'presynaptic_terminal', answer:'Presynaptic terminal', aliases:['axon terminal','synaptic terminal','terminal button','terminal bouton','bouton','presynaptic terminals','axon terminals','terminal'], cat:'neuron', unit:'L1', source:'Lecture 1 study guide', lab:'Action_Potential_Explorer.html',
    clues:[
      'Inside it, proteins called SNAREs zip together to fuse vesicles with the membrane, a process triggered by calcium entering through voltage-gated channels.',
      'It is packed with small membrane-bound spheres, each holding a few thousand molecules of transmitter.',
      'When an action potential arrives here, calcium rushes in and vesicles dump their contents into the synaptic cleft.',
      'The dendritic spine is the receiving side of a synapse; this is the sending side.',
      'The swelling at the end of an axon branch where neurotransmitter is stored and released onto the next neuron.'],
    learn:'The specialized ending of an axon branch at a synapse. It contains vesicles filled with neurotransmitter; an arriving action potential opens calcium channels, and calcium triggers vesicle fusion and transmitter release.' },

  { id:'action_potential', answer:'Action potential', aliases:['spike','spikes','nerve impulse','AP','action potentials'], cat:'neuron', unit:'L1', source:'Lecture 1 study guide', lab:'Action_Potential_Explorer.html',
    clues:[
      'Hodgkin and Huxley described it with four differential equations in 1952, solved by hand on a mechanical calculator, and won the 1963 Nobel Prize.',
      'During it the membrane voltage swings from about −70 mV to about +40 mV and back in roughly a millisecond.',
      'It is all-or-none: once threshold is crossed, its size does not depend on how strong the stimulus was.',
      'Postsynaptic potentials are small, graded, and fade with distance; this is large, fixed in size, and regenerates itself along the axon.',
      'The brief electrical spike that travels down an axon; the neuron\'s basic output signal.'],
    learn:'A brief (~1 ms), all-or-none electrical impulse produced when a neuron\'s membrane is depolarized past threshold. Driven by voltage-gated sodium then potassium channels, it propagates without decrement down the axon to the presynaptic terminals. Key features: threshold, all-or-none amplitude, propagation, refractory period.' },

  { id:'neurotransmitter', answer:'Neurotransmitter', aliases:['neurotransmitters','transmitter'], cat:'neuron', unit:'L1', source:'Lecture 1 study guide', lab:'Action_Potential_Explorer.html',
    clues:[
      'Dale\'s principle, as restated by Eccles, held that a neuron releases the same one of these at every terminal; the discovery of peptide co-release in the 1980s forced the rewrite.',
      'Glutamate and GABA account for most fast signaling in the cortex; dopamine, serotonin and acetylcholine act more like volume knobs.',
      'After release it is cleared from the cleft by reuptake transporters or enzymes; many drugs act by blocking that clearance.',
      'The action potential carries the signal along the axon; this carries it across the synapse.',
      'A chemical released from a presynaptic terminal that binds receptors on the next neuron, exciting or inhibiting it.'],
    learn:'A chemical messenger stored in vesicles in the presynaptic terminal and released into the synaptic cleft when an action potential arrives. It binds receptors on the postsynaptic neuron, producing excitatory or inhibitory postsynaptic potentials. Examples: glutamate, GABA, dopamine, serotonin, acetylcholine.' },

  { id:'cns', answer:'Central nervous system', aliases:['CNS'], cat:'anatomy', unit:'L1', source:'Lecture 1 study guide', lab:'MRI_Explorer.html',
    clues:[
      'It develops from the neural tube, and every part of it is wrapped in three membranes: dura, arachnoid and pia mater.',
      'It is bathed in cerebrospinal fluid and protected by a barrier that keeps most blood-borne molecules out.',
      'In humans it contains roughly 86 billion neurons, most of them in a part that is not the cerebral cortex.',
      'The nerves running to your fingertips belong to the peripheral nervous system; the tissue those nerves report to is this.',
      'The brain and the spinal cord, considered together.'],
    learn:'The brain and spinal cord. Contrast with the peripheral nervous system (nerves and ganglia outside the brain and spinal cord).' },

  { id:'pns', answer:'Peripheral nervous system', aliases:['PNS'], cat:'anatomy', unit:'L1', source:'Lecture 1 study guide',
    clues:[
      'Its myelin uses protein zero (P0) rather than proteolipid protein as the main structural protein, and its Wallerian degeneration clears debris in days rather than years.',
      'It includes 12 pairs of cranial nerves and 31 pairs of spinal nerves.',
      'It is divided into a somatic branch and an autonomic branch.',
      'Everything encased in skull and spine is the central nervous system; this is everything else.',
      'The nerves and ganglia outside the brain and spinal cord that connect the CNS to the rest of the body.'],
    learn:'All nervous tissue outside the brain and spinal cord: cranial and spinal nerves and their ganglia. Subdivided into the somatic nervous system (voluntary movement, conscious sensation) and the autonomic nervous system (involuntary control of organs).' },

  { id:'somatic', answer:'Somatic nervous system', aliases:['somatic'], cat:'anatomy', unit:'L1', source:'Lecture 1 study guide',
    clues:[
      'Its motor neurons have their cell bodies in the ventral horn of the spinal cord and connect directly to muscle, with no intervening ganglion.',
      'Its motor output uses a single neurotransmitter, acetylcholine, acting at the neuromuscular junction.',
      'Its sensory side carries touch, pain, temperature and body position; its motor side commands skeletal muscle.',
      'The autonomic nervous system runs your heart and gut without asking; this branch handles what you can feel and do on purpose.',
      'The part of the peripheral nervous system for voluntary movement and conscious sensation from skin, muscles and joints.'],
    learn:'The division of the peripheral nervous system that carries sensory information from skin, muscles and joints to the CNS and motor commands from the CNS to skeletal muscle; associated with voluntary action and conscious sensation.' },

  { id:'autonomic', answer:'Autonomic nervous system', aliases:['autonomic','ANS'], cat:'anatomy', unit:'L1', source:'Lecture 1 study guide',
    clues:[
      'Its two branches use different neurotransmitters at their targets: acetylcholine for one and mostly norepinephrine for the other.',
      'Its pathways always involve two neurons in series, with a synapse in a ganglion outside the CNS.',
      'Its sympathetic branch dilates the pupils and speeds the heart; its parasympathetic branch does the opposite.',
      'The somatic nervous system moves skeletal muscle under voluntary control; this one controls smooth muscle, cardiac muscle and glands, mostly without awareness.',
      'The "involuntary" division of the peripheral nervous system, with fight-or-flight (sympathetic) and rest-and-digest (parasympathetic) branches.'],
    learn:'The division of the peripheral nervous system that regulates internal organs, glands and smooth muscle largely outside conscious control. Its sympathetic branch mobilizes the body (fight or flight); its parasympathetic branch conserves and restores (rest and digest).' },

  { id:'dorsal', answer:'Dorsal', aliases:[], cat:'orientation', unit:'L1', source:'Lecture 1 study guide', lab:'MRI_Explorer.html',
    clues:[
      'In the developing neural tube it is the side patterned by BMP signals from the roof plate; the opposite side receives Sonic hedgehog from the floor plate.',
      'In the spinal cord it is unambiguous: it points toward the back. In the human brain the axis bends by about 90 degrees.',
      'Because the human neuraxis bends, in the brain this direction means the same as "superior."',
      'Ventral is toward the belly; this is its opposite.',
      'The anatomical direction meaning toward the back of the body, and toward the top of the human brain.'],
    learn:'Toward the back (of an animal). Because the human brain sits at a right angle to the spinal cord, dorsal in the brain means toward the top (superior). Opposite of ventral.' },

  { id:'ventral', answer:'Ventral', aliases:[], cat:'orientation', unit:'L1', source:'Lecture 1 study guide', lab:'MRI_Explorer.html',
    clues:[
      'In the embryo it is the side of the neural tube nearest the notochord, whose Sonic hedgehog signal induces motor neurons there.',
      'In the human brain this direction coincides with "inferior," toward the base of the skull.',
      'The visual pathway named for this direction runs from occipital cortex into the temporal lobe and handles object identity ("what").',
      'Dorsal is toward the back; this is its opposite.',
      'The anatomical direction meaning toward the belly, and toward the bottom of the human brain.'],
    learn:'Toward the belly (of an animal). In the human brain, ventral means toward the bottom (inferior). Opposite of dorsal.' },

  { id:'lateral', answer:'Lateral', aliases:[], cat:'orientation', unit:'L1', source:'Lecture 1 study guide', lab:'MRI_Explorer.html',
    clues:[
      'Of the six standard anatomical directions, it is the one Penfield\'s homunculus moves toward as the map runs from the leg representation to the face.',
      '"Ipsilateral" and "contralateral" describe whether two things are on the same or opposite sides; this word on its own describes distance from the midline.',
      'The temporal lobes are the most extreme example of this direction in the cerebral cortex.',
      'Medial is toward the midline; this is away from it.',
      'The anatomical direction meaning toward the side, away from the midline.'],
    learn:'Away from the midline, toward the side. Opposite of medial.' },

  { id:'medial', answer:'Medial', aliases:[], cat:'orientation', unit:'L1', source:'Lecture 1 study guide', lab:'MRI_Explorer.html',
    clues:[
      'It is the direction in which the homunculus\'s leg and foot representations lie, tucked onto the paracentral lobule inside the interhemispheric fissure.',
      'Structures with this label are best seen on a sagittal slice through the middle of the brain.',
      'The corpus callosum is the most obvious structure in this position in the brain.',
      'Lateral is away from the midline; this is toward it.',
      'The anatomical direction meaning toward the midline of the body or brain.'],
    learn:'Toward the midline. Opposite of lateral.' },

  { id:'anterior', answer:'Anterior', aliases:['rostral'], cat:'orientation', unit:'L1', source:'Lecture 1 study guide', lab:'MRI_Explorer.html',
    clues:[
      'The commissure that carries this name is a small bundle linking the two temporal lobes, and it is usually spared in a callosotomy.',
      'The commissure with this name is a small bundle of fibers connecting the two temporal lobes, far smaller than the corpus callosum.',
      'The frontal lobe is the most extreme example of this direction in the brain.',
      'Posterior is toward the back of the head; this is toward the face.',
      'The anatomical direction meaning toward the front.'],
    learn:'Toward the front. In the brain, equivalent to rostral. Opposite of posterior (caudal).' },

  { id:'posterior', answer:'Posterior', aliases:['caudal'], cat:'orientation', unit:'L1', source:'Lecture 1 study guide', lab:'MRI_Explorer.html',
    clues:[
      'The cingulate region that carries this name is the highest-metabolism node of the default mode network at rest.',
      'Combined with "parietal" it names the cortex most implicated in spatial attention and in reaching for what you see.',
      'The occipital lobe is the most extreme example of this direction in the brain.',
      'Anterior is toward the face; this is toward the back of the head.',
      'The anatomical direction meaning toward the back or rear.'],
    learn:'Toward the back. In the brain, equivalent to caudal. Opposite of anterior (rostral).' },

  { id:'coronal', answer:'Coronal', aliases:['coronal plane','coronal slice','coronal section','frontal plane','coronal view'], cat:'orientation', unit:'L1', source:'Lecture 1 study guide', lab:'MRI_Explorer.html',
    clues:[
      'The cranial suture that shares this name joins the frontal bone to the two parietal bones; its premature fusion produces brachycephaly.',
      'In the skull, the suture with this name joins the frontal bone to the two parietal bones.',
      'It is the plane in which you see both hemispheres and both temporal lobes at once, like a slice of bread cut from a loaf.',
      'A sagittal slice separates left from right; this plane separates front from back.',
      'The slice plane that divides the brain into front and back portions: a vertical cut from ear to ear.'],
    learn:'A vertical slice plane running from ear to ear, dividing the brain into anterior and posterior portions. Compare sagittal (left/right) and axial (top/bottom).' },

  { id:'sagittal', answer:'Sagittal', aliases:['sagittal plane','sagittal slice','sagittal section','midsagittal','sagittal view'], cat:'orientation', unit:'L1', source:'Lecture 1 study guide', lab:'MRI_Explorer.html',
    clues:[
      'The superior venous sinus that carries this name runs the length of the falx cerebri and is where most cerebrospinal fluid drains back into the blood through arachnoid granulations.',
      'The "mid-" version passes exactly through the interhemispheric fissure and shows the corpus callosum in its full arch.',
      'On this slice you see one hemisphere in profile, with the frontal lobe at one edge and the occipital lobe at the other.',
      'A coronal slice separates front from back; this plane separates left from right.',
      'The slice plane that divides the brain into left and right portions: a vertical cut from front to back.'],
    learn:'A vertical slice plane running from front to back, dividing the brain into left and right portions. A midsagittal slice runs exactly down the midline. Compare coronal (front/back) and axial (top/bottom).' },

  { id:'axial', answer:'Axial', aliases:['horizontal','transverse','axial plane','axial slice','horizontal plane','transverse plane','horizontal slice','transverse slice','axial view','axial section'], cat:'orientation', unit:'L1', source:'Lecture 1 study guide', lab:'MRI_Explorer.html',
    clues:[
      'Talairach\'s stereotaxic atlas defines its reference version as the plane through the anterior and posterior commissures.',
      'It is the native slice plane of CT scanners and of most clinical MRI, so it is the view radiologists read first.',
      'Its most common name refers to the long axis of the body: the plane cuts across that axis.',
      'Coronal and sagittal slices are both vertical; this is the one that is horizontal.',
      'The slice plane that divides the brain into upper and lower portions: a horizontal cut.'],
    learn:'A horizontal slice plane dividing the brain into upper and lower portions. Also called horizontal or transverse. Compare coronal (front/back) and sagittal (left/right).' },

  { id:'frontal_lobe', answer:'Frontal lobe', aliases:['frontal','frontal cortex','frontal lobes'], cat:'anatomy', unit:'L1', source:'Lecture 1 study guide', lab:'Cortex_Explorer.html',
    clues:[
      'Its area 4 is the only cortical region containing Betz cells, giant layer V pyramidal neurons whose axons run all the way to spinal motor neurons.',
      'Its posterior boundary is the central sulcus; its inferior boundary is the lateral (Sylvian) fissure.',
      'The strip along its back edge is primary motor cortex, the motor half of Penfield\'s map.',
      'The parietal lobe sits just behind the central sulcus; this lobe sits just in front of it.',
      'The largest lobe of the human brain, home to motor cortex, Broca\'s area, and the prefrontal cortex involved in planning and decision-making.'],
    learn:'The lobe anterior to the central sulcus and above the lateral fissure. Contains primary motor cortex (precentral gyrus), premotor areas, Broca\'s area, and prefrontal cortex (planning, working memory, decision-making).' },

  { id:'parietal_lobe', answer:'Parietal lobe', aliases:['parietal','parietal cortex','parietal lobes'], cat:'anatomy', unit:'L1', source:'Lecture 1 study guide', lab:'Cortex_Explorer.html',
    clues:[
      'Bálint\'s syndrome, with its optic ataxia and simultanagnosia, follows bilateral damage to it.',
      'Its anterior strip, just behind the central sulcus, is primary somatosensory cortex.',
      'Damage to its right side can cause hemispatial neglect, in which patients ignore the left half of space.',
      'The occipital lobe processes what you see; this lobe helps you know where it is and how to reach for it.',
      'The lobe at the top-back of the brain, behind the central sulcus, handling touch and spatial processing.'],
    learn:'The lobe posterior to the central sulcus and above the temporal lobe. Contains primary somatosensory cortex (postcentral gyrus) and association areas for spatial attention, spatial perception and sensorimotor integration.' },

  { id:'temporal_lobe', answer:'Temporal lobe', aliases:['temporal','temporal cortex','temporal lobes'], cat:'anatomy', unit:'L1', source:'Lecture 1 study guide', lab:'Cortex_Explorer.html',
    clues:[
      'Klüver–Bucy syndrome, seen in monkeys after bilateral removal of it, combines hyperorality, loss of fear and "psychic blindness."',
      'Its inner (medial) surface folds around to become the hippocampus.',
      'Heschl\'s gyrus, buried on its upper surface, is primary auditory cortex.',
      'The frontal lobe sits above the lateral (Sylvian) fissure; this lobe sits below it.',
      'The lobe on the side of the brain, beneath the lateral fissure, involved in hearing, language comprehension and memory.'],
    learn:'The lobe below the lateral (Sylvian) fissure. Contains primary auditory cortex, Wernicke\'s area (in the left hemisphere), the ventral visual stream for object and face recognition, and medial structures for memory (hippocampus).' },

  { id:'occipital_lobe', answer:'Occipital lobe', aliases:['occipital','occipital cortex','occipital lobes'], cat:'anatomy', unit:'L1', source:'Lecture 1 study guide', lab:'Cortex_Explorer.html',
    clues:[
      'Anton syndrome, in which cortically blind patients insist they can see, follows bilateral damage to it.',
      'Its boundary with the parietal lobe is a clear sulcus on the medial surface and an arbitrary line on the lateral surface.',
      'Primary visual cortex lies along a sulcus on its medial surface (the calcarine sulcus), and each half sees the opposite visual field.',
      'The temporal lobe handles hearing; this lobe handles vision.',
      'The lobe at the very back of the brain, devoted almost entirely to vision.'],
    learn:'The most posterior lobe. Contains primary visual cortex (V1, along the calcarine sulcus) and surrounding visual areas. Each hemisphere\'s occipital lobe represents the contralateral half of the visual field.' },

  { id:'gray_matter', answer:'Gray matter', aliases:['grey matter'], cat:'anatomy', unit:'L1', source:'Lecture 1 study guide', lab:'MRI_Explorer.html',
    clues:[
      'Its volume peaks in late childhood and then declines through adolescence, a thinning attributed mostly to synaptic pruning rather than cell death.',
      'Its darker color comes from the absence of the fatty insulation that makes the other tissue type pale.',
      'In the cerebrum it forms a sheet a few millimeters thick on the outside, plus clusters (nuclei) deep inside.',
      'White matter is the wiring; this is where the cell bodies, dendrites and synapses are.',
      'Brain tissue made mostly of neuron cell bodies, dendrites and synapses; the cortex is made of it.'],
    learn:'Nervous tissue rich in neuron cell bodies, dendrites, synapses and unmyelinated fibers. Forms the cerebral cortex and subcortical nuclei. Contrast with white matter (myelinated axons).' },

  { id:'white_matter', answer:'White matter', aliases:[], cat:'anatomy', unit:'L1', source:'Lecture 1 study guide', lab:'MRI_Explorer.html',
    clues:[
      'On a T1-weighted scan it appears bright because the lipids of myelin shorten the relaxation time of nearby water protons.',
      'In humans it occupies nearly half the volume of the cerebrum, a far larger share than in small-brained mammals.',
      'DTI images it by following the direction in which water diffuses most easily.',
      'Gray matter does the computing; this is the cabling that connects one gray region to another.',
      'Brain tissue made mostly of myelinated axons, connecting different regions of gray matter.'],
    learn:'Nervous tissue made mostly of myelinated axons, whose fatty myelin gives it a pale color. It forms the connections (tracts) between gray-matter regions, e.g. the corpus callosum. Imaged with DTI.' },

  { id:'sulcus', answer:'Sulcus', aliases:['sulci'], cat:'anatomy', unit:'L1', source:'Lecture 1 study guide', lab:'Cortex_Explorer.html',
    clues:[
      'Van Essen\'s tension-based theory holds that these form where axonal pulling draws strongly connected areas together, leaving weakly connected areas at the bottom of the fold.',
      'About two-thirds of the human cortical surface is hidden inside these.',
      'Cortical folding is thought to arise because the outer layers of cortex expand faster than the layers beneath them.',
      'A gyrus is the ridge of cortex that sticks out; this is the groove between ridges.',
      'A groove or valley on the surface of the cerebral cortex.'],
    learn:'A groove in the folded surface of the cerebral cortex. Sulci separate gyri (ridges); a particularly deep sulcus is called a fissure. Folding lets a large cortical sheet fit inside the skull.' },

  { id:'gyrus', answer:'Gyrus', aliases:['gyri'], cat:'anatomy', unit:'L1', source:'Lecture 1 study guide', lab:'Cortex_Explorer.html',
    clues:[
      'Heschl\'s, the transverse one on the superior temporal plane, is often doubled on the left and holds the tonotopic maps of primary auditory cortex.',
      'The precentral and postcentral ones are the primary motor and somatosensory strips, respectively.',
      'Many are named by position on a lobe: superior, middle and inferior temporal, for instance.',
      'A sulcus is the groove; this is the ridge between grooves.',
      'A ridge or bump on the surface of the cerebral cortex.'],
    learn:'A ridge of the folded cerebral cortex, bounded by sulci. Examples: precentral gyrus (motor), postcentral gyrus (somatosensory), superior temporal gyrus (auditory).' },

  { id:'fissure', answer:'Fissure', aliases:['fissures'], cat:'anatomy', unit:'L1', source:'Lecture 1 study guide', lab:'Cortex_Explorer.html',
    clues:[
      'The longitudinal one runs the full length of the brain and is occupied by a fold of dura mater called the falx cerebri.',
      'The lateral one is also named for the 17th-century anatomist Franciscus Sylvius.',
      'It is deep enough to serve as a boundary between lobes, or between the two hemispheres.',
      'A sulcus is a groove; this is a groove deep enough to divide major parts of the brain.',
      'A very deep sulcus, such as the one separating the two hemispheres or the one separating the temporal lobe from the frontal lobe.'],
    learn:'A very deep sulcus. The longitudinal (interhemispheric) fissure separates the hemispheres; the lateral (Sylvian) fissure separates the temporal lobe from the frontal and parietal lobes.' },

  { id:'central_sulcus', answer:'Central sulcus', aliases:['rolandic fissure','fissure of rolando','rolandic sulcus','sulcus of rolando','central fissure'], cat:'anatomy', unit:'L1', source:'Lecture 1 (lobes)', lab:'Cortex_Explorer.html',
    clues:[
      'On axial T2-weighted MRI, the cortex of its anterior bank is visibly thicker and darker than that of its posterior bank, one of the radiologist\'s tricks for identifying it.',
      'A distinctive hook-shaped "omega" in it marks the hand area of motor cortex on an axial MRI.',
      'Primary motor cortex lies on its anterior bank; primary somatosensory cortex lies on its posterior bank.',
      'The lateral fissure separates the temporal lobe from the frontal lobe; this groove separates the frontal lobe from the parietal lobe.',
      'The prominent groove running down the side of the brain that divides the frontal lobe from the parietal lobe.'],
    learn:'The deep sulcus separating the frontal lobe (anterior) from the parietal lobe (posterior). Motor cortex (precentral gyrus) lies in front of it, somatosensory cortex (postcentral gyrus) behind it.' },

  { id:'topographic', answer:'Topographic organization', aliases:['topographic map','topographic mapping','topographically organized','topography','topographic'], cat:'anatomy', unit:'L1', source:'Lecture 1 study guide', lab:'Cortex_Explorer.html',
    clues:[
      'In V1 its mathematical form is roughly a log-polar map: the fovea gets a hugely disproportionate share of cortex, a property called cortical magnification.',
      'Neighboring neurons in such an area respond to neighboring points in the input space, whether that space is the retina, the skin, or the cochlea\'s frequency axis.',
      'In V1 it is called retinotopy; in S1, somatotopy; in A1, tonotopy.',
      'Instead of scattering inputs randomly, cortex preserves the spatial layout of the sensory surface; the homunculus is the classic picture of it.',
      'The principle that a cortical area contains an orderly map of the sensory surface or body it represents, so that nearby neurons handle nearby locations.'],
    learn:'The organization of a cortical area as an orderly map of its input: adjacent locations on the retina, skin or cochlea are represented by adjacent locations in cortex (retinotopy, somatotopy, tonotopy). Penfield\'s homunculus is the classic example.' },

  { id:'homunculus', answer:'Homunculus', aliases:['motor homunculus','sensory homunculus','somatosensory homunculus','cortical homunculus','the homunculus'], cat:'anatomy', unit:'L1', source:'Lecture 1 (Penfield)', lab:'Cortex_Explorer.html',
    clues:[
      'The famous cartoon was drawn by medical illustrator Hortense Cantlie for a 1950 book on the cerebral cortex of man.',
      'Its proportions are distorted: the lips, tongue and hands are enormous and the trunk is tiny.',
      'There are two of them, roughly mirror images, on the front and back banks of the central sulcus.',
      'Retinotopy is the visual map; this is the name for the body map along motor and somatosensory cortex.',
      'Penfield\'s "little man": the distorted map of the body laid out along the motor and somatosensory strips of cortex.'],
    learn:'The map of the body along primary motor cortex (precentral gyrus) and primary somatosensory cortex (postcentral gyrus), discovered by Penfield\'s stimulation studies. Body parts are represented in proportion to their motor precision or sensory density, not their size.' },

  { id:'cortex', answer:'Cerebral cortex', aliases:['cortex','neocortex','the cortex'], cat:'anatomy', unit:'L1', source:'Lecture 1 (gross anatomy)', lab:'Cortex_Explorer.html',
    clues:[
      'Its layer IV is nearly absent in area 4 and thickest in area 17, where it is itself divided into sublayers a, b and c.',
      'Most of it has six layers, and layer 4 is where input from the thalamus arrives.',
      'It holds only about 16 billion of the brain\'s 86 billion neurons; the cerebellum, tucked beneath it, has far more.',
      'The cerebellum has more neurons, but this structure is where sensation, language and planning are computed.',
      'The folded outer sheet of gray matter covering the cerebral hemispheres, divided into four lobes.'],
    learn:'The thin (2–4 mm), highly folded outer layer of gray matter of the cerebral hemispheres, divided into frontal, parietal, temporal and occipital lobes. Most of it is six-layered neocortex.' },

  /* ---------------------------- LECTURE 2 ---------------------------- */
  { id:'ischemic', answer:'Ischemic stroke', aliases:['ischemia','ischemic','ischaemic stroke'], cat:'lesion', unit:'L2', source:'Lecture 2 study guide',
    clues:[
      'Its core and penumbra are told apart on diffusion–perfusion mismatch imaging, and its thrombolysis window is 4.5 hours.',
      'It accounts for roughly 85% of all strokes.',
      'The dead tissue is called an infarct, and the surrounding at-risk zone the penumbra.',
      'A hemorrhagic stroke is a vessel bursting; this is a vessel being blocked.',
      'A stroke caused by a blood clot or other blockage cutting off the blood supply to part of the brain.'],
    learn:'A stroke caused by blockage of a blood vessel (by a clot or embolus), starving downstream tissue of oxygen and glucose. The most common type of stroke. Contrast with hemorrhagic stroke (bleeding).' },

  { id:'hemorrhagic', answer:'Hemorrhagic stroke', aliases:['hemorrhage','haemorrhagic stroke','brain hemorrhage','hemorrhagic','bleed'], cat:'lesion', unit:'L2', source:'Lecture 2 study guide',
    clues:[
      'Its subarachnoid form classically announces itself with a "thunderclap" headache and is most often caused by a ruptured berry aneurysm on the circle of Willis.',
      'Its two main subtypes are named by where the blood goes: into the brain tissue itself or into the space beneath the arachnoid membrane.',
      'Its damage comes as much from the pressure and toxicity of pooled blood as from lost supply downstream.',
      'An ischemic stroke is a blocked vessel; this is a ruptured one.',
      'A stroke caused by bleeding in or around the brain when a blood vessel bursts.'],
    learn:'A stroke caused by the rupture of a blood vessel, with bleeding into brain tissue or the surrounding space. Less common than ischemic stroke but often more dangerous.' },

  { id:'lesion', answer:'Lesion', aliases:['lesions','lesion method','lesion studies','lesion study','brain lesion','brain damage'], cat:'lesion', unit:'L2', source:'Lecture 2 (methods)',
    clues:[
      'Muscimol and lidocaine produce reversible versions of it; ibotenic acid produces the permanent kind while sparing fibers of passage.',
      'In animals it can be made deliberately with heat, chemicals or surgery; in humans it comes from stroke, tumor, injury or surgery for epilepsy.',
      'Its logic is the closest cognitive neuroscience gets to a true test of necessity: remove the region and see what fails.',
      'fMRI can show a region is active during a task; only this approach (or TMS) can show the region is necessary for it.',
      'Damage to a region of the brain; studying patients with such damage is the oldest method for linking brain regions to functions.'],
    learn:'Damage to a circumscribed region of brain tissue (from stroke, injury, surgery, or deliberately in animals). Comparing what patients with a lesion can and cannot do reveals what the damaged region is necessary for; single and double dissociations formalize this logic.' },

  { id:'single_dissociation', answer:'Single dissociation', aliases:['single dissociations','dissociation'], cat:'lesion', unit:'L2', source:'Lecture 2 study guide',
    clues:[
      'Shallice\'s "resource artifact" is the standard objection to it: one damaged resource, drawn on unequally by two tasks, can mimic a selective deficit.',
      'It has the form "patient A is impaired on task X but performs normally on task Y."',
      'It shows two abilities can come apart, but not that they depend on different brain systems.',
      'A double dissociation needs a second patient with the reverse pattern; this needs only one pattern.',
      'A pattern in which brain damage impairs one ability while leaving another intact, suggesting the two are at least partly independent.'],
    learn:'A finding that damage to a brain region impairs one function (task X) while sparing another (task Y). It suggests the functions are separable, but is open to the objection that X is simply harder than Y.' },

  { id:'double_dissociation', answer:'Double dissociation', aliases:['double dissociations'], cat:'lesion', unit:'L2', source:'Lecture 2 study guide',
    clues:[
      'Dunn and Kirsner argued in 1988 and again in 2003 that even this cannot logically guarantee two separate systems, since a single nonlinear system can produce crossover patterns.',
      'Prosopagnosia versus object agnosia is a textbook example: some patients cannot recognize faces but can recognize objects, and others show the reverse.',
      'It rules out the "one task is just harder" explanation, because each task is the harder one for somebody.',
      'A single dissociation is one patient with one pattern; this requires two patients (or groups) with opposite patterns of sparing and impairment.',
      'The pattern where lesion A impairs task X but not Y, and lesion B impairs Y but not X: the gold-standard evidence that two functions rely on different brain regions.'],
    learn:'Two complementary single dissociations: damage to region A impairs function X but not Y, while damage to region B impairs Y but not X. This is the strongest lesion evidence that X and Y depend on different brain systems, since it cannot be explained by one task being harder.' },

  { id:'tms', answer:'TMS', aliases:['transcranial magnetic stimulation'], cat:'methods', unit:'L2', source:'Lecture 2 study guide',
    clues:[
      'Anthony Barker\'s group in Sheffield first demonstrated it in 1985 by making a volunteer\'s hand twitch.',
      'A figure-eight coil concentrates the field so the induced current is strongest just under the coil\'s center, a few centimeters deep.',
      'It works by Faraday induction: a rapidly changing magnetic field induces an electrical current in the cortex beneath it.',
      'fMRI and EEG only observe; this method briefly disrupts (or excites) a region, so it can test whether the region is necessary.',
      'A non-invasive method that uses a magnetic coil held against the scalp to create a temporary "virtual lesion" or to stimulate cortex.'],
    learn:'Transcranial magnetic stimulation: a coil on the scalp produces brief magnetic pulses that induce electrical currents in the underlying cortex, transiently disrupting or exciting it. Because it manipulates brain activity, it can test whether a region is necessary for a function (a reversible "virtual lesion").' },

  { id:'eeg', answer:'EEG', aliases:['electroencephalography','electroencephalogram','electroencephalograph'], cat:'methods', unit:'L2', source:'Lecture 2 study guide',
    clues:[
      'Hans Berger recorded the first human trace in 1924 and sat on the result for five years before publishing, fearing ridicule.',
      'Its signal is thought to come mostly from summed postsynaptic potentials in aligned cortical pyramidal neurons, not from action potentials.',
      'The skull and scalp smear the signal, so working out where it came from is mathematically ill-posed (the "inverse problem").',
      'MEG measures the magnetic side of the same neural currents; this method measures the electrical side, through electrodes on the scalp.',
      'Recording the brain\'s electrical activity with electrodes on the scalp: millisecond timing, poor spatial resolution.'],
    learn:'Electroencephalography: recording voltage fluctuations at the scalp produced by the summed postsynaptic potentials of large populations of cortical neurons. Excellent temporal resolution (milliseconds), poor spatial resolution. ERPs are derived from it by averaging.' },

  { id:'erp', answer:'ERP', aliases:['event related potential','event-related potential','evoked potential','event related potentials','evoked potentials','erps'], cat:'methods', unit:'L2', source:'Lecture 2 study guide',
    clues:[
      'Its N400 component, discovered by Kutas and Hillyard in 1980 with sentences ending in semantic anomalies, has been used more than any other measure to study meaning in the brain.',
      'Components are named by polarity and latency (N170, P300) or by function (mismatch negativity).',
      'It is invisible in a single trial; it emerges only after averaging tens or hundreds of trials aligned to the event.',
      'Raw EEG is a continuous wiggle; this is the piece of it that is time-locked to a specific stimulus or response.',
      'The averaged EEG response to a particular event, obtained by aligning many trials to the event\'s onset.'],
    learn:'Event-related potential: the brain\'s electrical response to a specific stimulus or event, extracted from EEG by averaging many trials time-locked to the event so that random background activity cancels out. Components (e.g. N170, P300) are named by polarity and latency.' },

  { id:'psp', answer:'Postsynaptic potential', aliases:['PSP','EPSP','IPSP','postsynaptic potentials','excitatory postsynaptic potential','inhibitory postsynaptic potential','post-synaptic potential'], cat:'neuron', unit:'L2', source:'Lecture 2 study guide', lab:'Action_Potential_Explorer.html',
    clues:[
      'Eccles won the 1963 Nobel Prize partly for recording these inside spinal motor neurons with microelectrodes.',
      'They sum in space and time: many small ones arriving close together can add up to cross threshold.',
      'They come in an excitatory kind that depolarizes the cell and an inhibitory kind that hyperpolarizes it.',
      'The action potential is all-or-none and travels down the axon; this is graded, local, and happens on the receiving side of a synapse.',
      'The small change in a neuron\'s membrane voltage caused by neurotransmitter binding to receptors on its dendrites or cell body (EPSP or IPSP).'],
    learn:'A graded change in the membrane potential of the receiving neuron caused by neurotransmitter binding at a synapse. Excitatory PSPs depolarize (toward threshold), inhibitory PSPs hyperpolarize. They summate; if the sum at the axon hillock crosses threshold, an action potential fires. Summed PSPs are the main source of the EEG signal.' },

  { id:'meg', answer:'MEG', aliases:['magnetoencephalography','magnetoencephalogram'], cat:'methods', unit:'L2', source:'Lecture 2 study guide',
    clues:[
      'Its sensors, SQUIDs, must be bathed in liquid helium and operate at about −269 °C.',
      'The brain\'s magnetic fields are hundreds of millions of times weaker than Earth\'s, so the recording is done inside a magnetically shielded room.',
      'The skull barely distorts magnetic fields, which gives it better source localization than its electrical counterpart.',
      'EEG picks up the electrical potentials of neural currents through the scalp; this method picks up the magnetic fields those same currents produce.',
      'Recording the tiny magnetic fields produced by neural activity, with millisecond timing.'],
    learn:'Magnetoencephalography: recording the very weak magnetic fields generated by neuronal currents, using superconducting sensors (SQUIDs). Same millisecond temporal resolution as EEG, with somewhat better spatial localization because magnetic fields pass through the skull undistorted.' },

  { id:'pet', answer:'PET', aliases:['positron emission tomography','pet scan','pet scanning'], cat:'methods', unit:'L2', source:'Lecture 2 study guide',
    clues:[
      'Its workhorse tracer is a glucose analog that is trapped after phosphorylation by hexokinase, so it accumulates in proportion to metabolic demand.',
      'Its tracers decay so quickly (fluorine-18 has a half-life of about 110 minutes) that a cyclotron usually has to be nearby.',
      'It can image specific molecules, such as dopamine receptors or amyloid plaques, which MRI cannot.',
      'fMRI infers activity from blood oxygenation without injecting anything; this method requires a radioactive tracer.',
      'Imaging brain function or chemistry by injecting a radioactive tracer and detecting where in the brain it accumulates.'],
    learn:'Positron emission tomography: a radioactive tracer (e.g. labeled glucose or water, or a receptor ligand) is injected and its distribution imaged by detecting the gamma rays produced when emitted positrons annihilate. Measures blood flow, metabolism or neurochemistry; low temporal resolution and requires radiation.' },

  { id:'mri', answer:'MRI', aliases:['magnetic resonance imaging','structural MRI','structural mri scan','mri scan'], cat:'methods', unit:'L2', source:'Lecture 2 & 3 study guides', lab:'MRI_Explorer.html',
    clues:[
      'Lauterbur\'s 1973 Nature paper produced its first image, two tubes of water, by superimposing a gradient on the main field so that resonance frequency encoded position.',
      'It excites hydrogen nuclei with a radio-frequency pulse and listens to the signal they emit as they relax back into alignment.',
      'A typical research scanner\'s magnet is 3 tesla, about 60,000 times the strength of Earth\'s magnetic field.',
      'CT uses X-rays and shows bone well; this method uses magnets and radio waves and shows soft tissue in fine detail.',
      'Producing detailed anatomical pictures of the brain using a strong magnetic field and radio waves.'],
    learn:'Magnetic resonance imaging: a strong magnetic field aligns hydrogen nuclei (protons) in tissue; radio-frequency pulses knock them out of alignment, and the signal they emit as they relax is used to build an image. Different tissues (gray matter, white matter, CSF) relax at different rates, giving contrast. Structural MRI shows anatomy; fMRI uses the same scanner to measure BOLD signal.' },

  { id:'fmri', answer:'fMRI', aliases:['functional mri','functional magnetic resonance imaging'], cat:'decoding', unit:'L2', source:'Lecture 2 & 3 study guides', lab:'Decoder_Playground.html',
    clues:[
      'Seiji Ogawa first reported its oxygenation-sensitive contrast in rats in 1990; the first human activation maps followed within two years.',
      'Its signal responds slowly, peaking about 5–6 seconds after a brief burst of neural activity.',
      'It does not measure neurons directly; it measures a change in the blood.',
      'EEG tells you when, with millisecond precision; this method tells you where, with millimeter precision.',
      'Mapping brain activity by measuring the BOLD signal in an MRI scanner.'],
    learn:'Functional MRI: measuring brain activity indirectly through the BOLD signal, which rises when active tissue receives a surge of oxygenated blood. Good spatial resolution (millimeters), poor temporal resolution (seconds), non-invasive. The basis for both subtraction-logic experiments and decoding (MVPA).' },

  { id:'bold', answer:'BOLD signal', aliases:['BOLD','blood oxygen level dependent','blood-oxygen-level-dependent signal','bold response','bold contrast','bold signal'], cat:'decoding', unit:'L2', source:'Lecture 2 & 3 study guides', lab:'Decoder_Playground.html',
    clues:[
      'Linus Pauling discovered the underlying physics in 1936: hemoglobin\'s magnetic properties change when it lets go of oxygen.',
      'Its rise is caused, paradoxically, by an oversupply: active regions receive more oxygenated blood than they consume.',
      'Deoxygenated hemoglobin is paramagnetic and disturbs the local magnetic field, weakening the MRI signal; when it is flushed out, the signal rises.',
      'PET needs an injected tracer; here the contrast agent is the body\'s own hemoglobin.',
      'The fMRI signal that increases when active brain tissue receives a surge of oxygenated blood.'],
    learn:'Blood-oxygen-level-dependent signal: the fMRI signal. Neural activity triggers an increase in local blood flow that overshoots oxygen demand, raising the ratio of oxyhemoglobin to deoxyhemoglobin. Because deoxyhemoglobin is paramagnetic and suppresses MRI signal, less of it means a stronger signal. Higher BOLD = higher oxy/deoxy ratio.' },

  { id:'dti', answer:'DTI', aliases:['diffusion tensor imaging','diffusion mri','diffusion imaging','tractography','diffusion weighted imaging','DWI'], cat:'methods', unit:'L2', source:'Lecture 2 study guide',
    clues:[
      'Basser, Mattiello and Le Bihan introduced it in 1994, replacing the scalar apparent diffusion coefficient with a full 3×3 matrix estimated from at least six gradient directions.',
      'Its key summary number, fractional anisotropy, is near zero in cerebrospinal fluid and high in tightly bundled fibers.',
      'Water diffuses more freely along axons than across them, and the method exploits that asymmetry.',
      'fMRI maps where gray matter is active; this method maps the white-matter pathways that connect those regions.',
      'An MRI technique that tracks the diffusion of water to map white-matter fiber tracts.'],
    learn:'Diffusion tensor imaging: an MRI technique that measures the direction-dependence of water diffusion. Because water moves more easily along myelinated axons than across them, DTI can reconstruct the orientation and course of white-matter tracts (tractography). It shows structural connectivity, not activity.' },

  { id:'temporal_resolution', answer:'Temporal resolution', aliases:['time resolution'], cat:'methods', unit:'L2', source:'Lecture 2 (comparing methods)',
    clues:[
      'For fMRI it is limited less by the scanner than by physiology: the hemodynamic response is sluggish no matter how fast you sample.',
      'EEG and MEG have it in abundance (milliseconds); PET has almost none (tens of seconds to minutes).',
      'A method with a good value of it can tell whether a face is recognized before or after 200 ms.',
      'Spatial resolution asks "where, how precisely?"; this asks "when, how precisely?"',
      'How precisely a method can tell when something happened in the brain.'],
    learn:'The precision with which a method can resolve the timing of brain events. EEG and MEG: milliseconds. fMRI: seconds (limited by the slow hemodynamic response). PET: tens of seconds or more. Usually traded off against spatial resolution.' },

  { id:'spatial_resolution', answer:'Spatial resolution', aliases:[], cat:'methods', unit:'L2', source:'Lecture 2 (comparing methods)',
    clues:[
      'For EEG it is worse than the electrode spacing suggests, because the skull blurs the currents before they reach the scalp.',
      'Single-unit recording has it at the level of one cell; fMRI at a millimeter or two; EEG at centimeters at best.',
      'In fMRI it is set by the size of the voxel.',
      'Temporal resolution asks "when, how precisely?"; this asks "where, how precisely?"',
      'How precisely a method can tell where in the brain something happened.'],
    learn:'The precision with which a method can localize brain activity. fMRI and structural MRI: millimeters. PET: several millimeters to a centimeter. EEG/MEG: centimeters, and uncertain. Usually traded off against temporal resolution.' },

  /* ---------------------------- LECTURE 3 ---------------------------- */
  { id:'voxel', answer:'Voxel', aliases:['voxels'], cat:'decoding', unit:'L3', source:'Lecture 3 study guide', lab:'MRI_Explorer.html',
    clues:[
      'Partial-volume effects arise because a single one can straddle gray matter, white matter and cerebrospinal fluid, its signal being an average of all three.',
      'In a typical fMRI scan it is 2–3 mm on a side and there are about 100,000 of them covering the brain.',
      'One measuring 3 mm on a side contains something on the order of a million neurons and billions of synapses.',
      'A pixel is a square element of a 2-D picture; this is the 3-D equivalent.',
      'The smallest unit of an MRI image: a tiny cube of brain tissue with a single measured value.'],
    learn:'A volume element: the 3-D equivalent of a pixel. Each voxel in an MRI or fMRI image is a small cube of tissue (typically 1–3 mm on a side) with one signal value. A 3 mm cubic voxel contains roughly a million neurons, so fMRI measures the pooled activity of very large populations.' },

  { id:'subtraction', answer:'Subtraction logic', aliases:['subtraction','subtraction method','cognitive subtraction','subtraction design','subtraction analysis','the subtraction method'], cat:'decoding', unit:'L3', source:'Lecture 3 study guide', lab:'Decoder_Playground.html',
    clues:[
      'Its founding assumption, pure insertion, was named by Sternberg in 1969 in the same paper that introduced the additive-factors method as a way around it.',
      'Its hidden assumption is "pure insertion": adding one process to a task leaves all the other processes unchanged.',
      'Its output is a statistical map of where one condition produced more activation than another.',
      'Decoding asks whether the pattern of activity predicts the condition; this asks whether a region is more active in one condition than in a control.',
      'Comparing brain activity in two conditions that differ in only one process, so that whatever activation survives the comparison is attributed to that process.'],
    learn:'The design logic of most classic fMRI experiments: compare activity in an experimental condition with a control condition that differs in only one cognitive process (e.g. intact objects vs. scrambled objects). Activation that survives the subtraction is attributed to that process. Assumes the added process does not change the others (pure insertion). Associated with forward inference.' },

  { id:'roi', answer:'Region of interest', aliases:['ROI','ROIs','regions of interest'], cat:'decoding', unit:'L3', source:'Lecture 3 study guide', lab:'Decoder_Playground.html',
    clues:[
      'Choosing it after looking at the same data you then test it on is a form of "double dipping," a circularity flagged in a well-known 2009 critique.',
      'It can be drawn from anatomy, defined by a separate "localizer" scan, or taken from an atlas.',
      'Analyzing only the voxels inside it means far fewer statistical tests than a whole-brain search.',
      'A whole-brain analysis tests every voxel; this restricts attention to a chosen set of voxels.',
      'The set of voxels (an anatomical or functional area) that an fMRI analysis focuses on, usually abbreviated with three letters.'],
    learn:'A predefined set of voxels (an anatomical region or a functionally localized area) on which an fMRI analysis is focused, rather than testing every voxel in the brain. Common in both subtraction and decoding analyses.' },

  { id:'mvpa', answer:'MVPA', aliases:['multivariate pattern analysis','multi-voxel pattern analysis','multivoxel pattern analysis','decoding','neural decoding','pattern classification','pattern analysis','multivariate decoding'], cat:'decoding', unit:'L3', source:'Lecture 3 study guide', lab:'Decoder_Playground.html',
    clues:[
      'Haxby\'s 2001 study of ventral temporal cortex is usually cited as its debut in fMRI: object categories could be told apart from distributed patterns even after removing each category\'s "peak" region.',
      'Its classifiers, often linear support vector machines, must be tested on held-out data or their accuracy is meaningless.',
      'It can find information in a region whose overall activation does not differ between conditions at all.',
      'A subtraction analysis asks how much a region activates; this asks what the pattern across its voxels can tell you.',
      'Using the pattern of activity across many voxels to decode which condition a person is experiencing.'],
    learn:'Multivariate (multi-voxel) pattern analysis: a classifier is trained to predict the experimental condition from the pattern of activity across many voxels, then tested on new trials. Above-chance accuracy shows the region carries information about the condition, even when its mean activation does not differ. Associated with reverse inference; applicable to EEG, MEG and single-unit data as well as fMRI.' },

  { id:'forward_inference', answer:'Forward inference', aliases:['forward inferences'], cat:'decoding', unit:'L3', source:'Lecture 3 study guide',
    clues:[
      'Poldrack\'s 2006 critique treated it as neuroimaging\'s default logic: the direction in which an experiment actually estimates a conditional probability.',
      'Its form is "if mental process X is engaged, then brain region Y is active."',
      'It is what a standard subtraction experiment delivers when it works.',
      'Reverse inference reads mind from brain; this reads brain from mind.',
      'Reasoning from a manipulated mental state to the brain activity it produces: "when people do X, region Y activates."'],
    learn:'Inference from a manipulated cognitive state to brain activity: "engaging process X activates region Y." The logic of subtraction-design experiments. Contrast with reverse inference.' },

  { id:'reverse_inference', answer:'Reverse inference', aliases:['reverse inferences','backward inference'], cat:'decoding', unit:'L3', source:'Lecture 3 study guide', lab:'Decoder_Playground.html',
    clues:[
      'Its validity depends on how selective the region is: the more different things a region does, the weaker the inference (Poldrack\'s 2006 critique).',
      '"The amygdala lit up, so the participant was afraid" is a textbook example of doing it too loosely.',
      'Decoding methods make it rigorous by measuring how well brain activity actually predicts the mental state.',
      'Forward inference goes from mental state to brain activity; this goes the other way.',
      'Reasoning from observed brain activity back to the mental state that caused it: "region Y is active, so the person must be doing X."'],
    learn:'Inference from observed brain activity back to a cognitive state: "region Y is active, therefore process X is engaged." Weak when a region is engaged by many processes; decoding methods make it quantitative by testing how well activity predicts the state. Contrast with forward inference.' },

  { id:'deoxyhemoglobin', answer:'Deoxyhemoglobin', aliases:['deoxygenated hemoglobin','deoxy-hemoglobin','deoxyhaemoglobin','deoxygenated haemoglobin','deoxy hemoglobin'], cat:'decoding', unit:'L3', source:'Lecture 3 study guide', lab:'Decoder_Playground.html',
    clues:[
      'Its iron is in a high-spin state with four unpaired electrons, which is what makes it paramagnetic.',
      'Because it distorts the local magnetic field, MRI signal is lower wherever there is more of it.',
      'Active brain tissue ends up with less of it, not more, because blood flow overshoots demand.',
      'Oxyhemoglobin is magnetically almost invisible; this form of the molecule is what fMRI actually "sees."',
      'Hemoglobin that has given up its oxygen; a lower ratio of it to oxyhemoglobin means a higher BOLD signal.'],
    learn:'Hemoglobin without bound oxygen. It is paramagnetic, so it distorts the local magnetic field and reduces MRI signal. Neural activity increases blood flow more than oxygen use, lowering the local concentration of deoxyhemoglobin and raising the BOLD signal.' },

  { id:'block_design', answer:'Block design', aliases:['blocked design','block designs','blocked'], cat:'decoding', unit:'L3', source:'Lecture 3 (subtraction demo)', lab:'Decoder_Playground.html',
    clues:[
      'It is statistically more efficient for detecting activation than an event-related design, at the cost of being unable to separate individual trials.',
      'Typical epochs last 15–30 seconds, long enough for the sluggish hemodynamic response to reach a plateau.',
      'The lecture example alternated intact objects, scrambled objects and fixation in repeating stretches.',
      'An event-related design presents brief, intermixed trials; this presents the same condition repeatedly for an extended stretch.',
      'An fMRI experimental design in which conditions are presented in alternating extended periods rather than as individual trials.'],
    learn:'An fMRI design in which each condition is presented continuously for a block of time (often 15–30 s), alternating with other conditions or rest. The BOLD signal in each block is compared across conditions (subtraction logic). Contrast with event-related designs.' },

  { id:'loc', answer:'Lateral occipital complex', aliases:['LOC','lateral occipital cortex','lateral occipital','lateral occipital area'], cat:'decoding', unit:'L3', source:'Lecture 3 (subtraction demo)', lab:'Cortex_Explorer.html',
    clues:[
      'Malach and colleagues named it in 1995 using exactly the contrast shown in lecture: objects versus scrambled versions of the same objects.',
      'It responds to object shape regardless of whether the shape is defined by luminance, texture or motion.',
      'It lies on the lateral surface at the boundary of the occipital and temporal lobes.',
      'Early visual cortex responds just as strongly to scrambled pictures; this region responds only when the pieces form an object.',
      'The region of visual cortex that responds more to intact objects than to scrambled objects, usually abbreviated with three letters.'],
    learn:'A region on the lateral surface of the occipito-temporal cortex that responds more strongly to intact objects than to scrambled versions of the same images, implicating it in object-shape processing. Defined with the intact-vs-scrambled subtraction shown in lecture.' },

  { id:'cross_validation', answer:'Cross-validation', aliases:['cross validation','crossvalidation','k-fold cross-validation','k fold','leave one out','train test split','train/test split'], cat:'decoding', unit:'L3', source:'Lecture 3 (decoding)', lab:'Decoder_Playground.html',
    clues:[
      'Its "leave-one-run-out" form is standard in fMRI because trials within a run share slow drifts that would otherwise leak into the test set.',
      'With k partitions of the data, each partition takes one turn as the held-out set and the k accuracies are averaged.',
      'Without it, a classifier can score 100% on data it has already seen, even when the labels are random.',
      'A single train/test split throws away test data for training; this rotates the split so every trial is tested exactly once.',
      'Training a decoder on some trials and testing it on held-out trials, repeated so that accuracy is measured only on data the decoder never saw.'],
    learn:'The procedure of measuring a decoder\'s accuracy only on trials it was not trained on, typically by dividing the data into folds and rotating which fold is held out. Prevents the classifier from getting credit for memorizing noise.' },

  { id:'classifier', answer:'Classifier', aliases:['decoder','support vector machine','svm','pattern classifier','linear classifier','classifiers'], cat:'decoding', unit:'L3', source:'Lecture 3 (decoding)', lab:'Decoder_Playground.html',
    clues:[
      'Vapnik\'s version, built on the principle of structural risk minimization, became the fMRI default in the 2000s because it copes with many voxels and few trials.',
      'Linear ones compute a weighted sum of voxel values and compare it with a threshold.',
      'Its accuracy is compared with chance, 50% for two conditions, usually with a permutation test.',
      'A subtraction map shows where activation differs; this is the algorithm that turns a pattern of activity into a prediction.',
      'In decoding, the algorithm trained to predict the experimental condition from a pattern of brain activity.'],
    learn:'An algorithm (e.g. a linear support vector machine) trained to predict a category label from a pattern of brain activity. In MVPA, its accuracy on held-out trials, compared with chance, measures how much information the pattern carries.' },

  /* ---------------------------- LECTURE 4 ---------------------------- */
  { id:'selective_attention', answer:'Selective attention', aliases:['selection','attentional selection','attention'], cat:'attention', unit:'L4', source:'Lecture 4 study guide',
    clues:[
      'Cherry\'s 1953 dichotic-listening experiments, in which people shadowed one ear and noticed almost nothing about the other, launched the "cocktail party" literature that Broadbent\'s filter theory tried to explain five years later.',
      'It has been called the flexible control of limited computational resources: the brain cannot process everything that reaches its receptors, so some inputs must win over others.',
      'Its effects show up at every level of measurement: faster reaction times, larger sensory ERPs, higher firing rates and stronger BOLD responses for the attended input, with weaker responses for the ignored one.',
      'Non-selective attention is a matter of overall alertness or arousal; this is the choosing of some inputs, locations or features over others.',
      'The gating of perception so that some of the information arriving at the senses is processed preferentially while the rest is suppressed; James called it "withdrawal from some things in order to deal effectively with others."'],
    learn:'The prioritization of some sensory inputs, locations, objects or features over others, because the brain\'s processing capacity is limited. Defining properties: it is selective (some things win, others lose), capacity-limited, and can be deployed voluntarily (endogenous) or captured by stimuli (exogenous), overtly (with receptor orienting) or covertly (without). It enhances behavioral performance and neural responses for attended inputs and suppresses the unattended.' },

  { id:'william_james', answer:'William James', aliases:['James'], cat:'history', unit:'L4', source:'Lecture 4 (definition of attention)',
    clues:[
      'He took twelve years to write his two-volume magnum opus, which Henry Holt had contracted for two, and his younger brother Henry became the more famous writer in the family.',
      'He taught the first psychology course in the United States, at Harvard, and later remarked that the first lecture on the subject he ever heard was his own.',
      'His 1890 textbook opens its chapter on our topic with the line "Everyone knows what attention is."',
      'Helmholtz demonstrated covert attention with a physics experiment; this American philosopher gave the classic verbal definition of attention.',
      'The author of Principles of Psychology (1890), who described attention as "the taking possession of the mind, in clear and vivid form, of one out of what seem several simultaneously possible objects or trains of thought."'],
    learn:'American psychologist and philosopher (1842–1910), author of Principles of Psychology (1890). His definition of attention as "focalization, concentration of consciousness" that "implies withdrawal from some things in order to deal effectively with others" captures the two core properties of selective attention: enhancement of the selected and suppression of the rest.' },

  { id:'helmholtz', answer:'Hermann von Helmholtz', aliases:['Helmholtz','von Helmholtz','Herman von Helmholtz'], cat:'history', unit:'L4', source:'Lecture 4 (covert attention)',
    clues:[
      'He invented the ophthalmoscope in 1851, formulated the law of conservation of energy, and measured the speed of nerve conduction in a frog, all before turning to the psychology of perception.',
      'In his famous demonstration he used a brief electric spark to illuminate a screen of letters in a dark room, too briefly for the eyes to move.',
      'He found he could choose in advance which part of the screen he would read, without moving his eyes, and that the letters there were perceived while the rest were not.',
      'Posner measured covert attention with reaction times; this 19th-century physicist and physiologist first demonstrated it on himself.',
      'The German scientist who showed in the 1890s that one can "concentrate attention on the sensation from a particular part" of the visual field "without eye movements," the first clear demonstration of covert spatial attention.'],
    learn:'German physicist and physiologist (1821–1894). In a self-experiment using a spark-illuminated array of letters, he showed that attention could be directed to a peripheral region of the visual field without moving the eyes, and that letters in the attended region were perceived while others were not. This is the classic early demonstration of covert visual-spatial attention.' },

  { id:'overt_attention', answer:'Overt attention', aliases:['overt','overt orienting','overt selective attention'], cat:'attention', unit:'L4', source:'Lecture 4 study guide',
    clues:[
      'The premotor theory of attention (Rizzolatti, 1987) holds that a covert shift is really a saccade that was planned but not executed, tying this form of attention to its hidden twin at the level of the motor system.',
      'In vision it is typically accomplished about three times a second, by saccades that bring a target onto the fovea.',
      'Its telltale signs, eye movements and head turns, mean it can be measured directly with an eye tracker.',
      'Covert attention leaves the sensory receptors where they are; this kind moves them.',
      'Attention that can be observed externally because it involves orienting the sense organs (eyes, head, ears) toward the selected input.'],
    learn:'Attention accompanied by orienting of the receptors, most obviously eye movements that bring the attended location onto the fovea, or turning the head toward a sound. Observable from the outside, and in vision it is measured with eye tracking. Contrast with covert attention.' },

  { id:'covert_attention', answer:'Covert attention', aliases:['covert','covert orienting','covert selective attention','covert spatial attention','covert visual-spatial attention','covert visuospatial attention'], cat:'attention', unit:'L4', source:'Lecture 4 study guide',
    clues:[
      'Its usual metaphor, a "spotlight" that can be moved without moving the eyes, was popularized by Posner in 1980, and the rival "zoom lens" model (Eriksen and St. James, 1986) added that its size can change too.',
      'Every experiment on it must control for eye position, typically by requiring fixation on a central cross and monitoring the eyes.',
      'It is the kind of attention the lecture focused on: the visual receptors stay put, yet processing at the attended location improves.',
      'Overt attention turns the eyes toward the target; this shifts processing priority without any change in the receptors.',
      'Attention directed to a location or object without orienting the sense organs, so it cannot be observed from the outside; Helmholtz demonstrated it with a spark and a screen of letters.'],
    learn:'Attention deployed without moving the eyes or other receptors, so that it is not externally observable. Demonstrated by Helmholtz and measured with Posner cuing: the same physical stimulus is processed faster and more accurately, and evokes larger neural responses, when it appears at the covertly attended location. The main focus of the lecture was voluntary covert visual-spatial attention.' },

  { id:'endogenous_attention', answer:'Endogenous attention', aliases:['endogenous','voluntary attention','goal-directed attention','top-down attention','goal directed attention','top down attention','voluntary'], cat:'attention', unit:'L4', source:'Lecture 4 study guide',
    clues:[
      'From the Greek endon, "within," and genes, "born": Posner adopted the term to mark orienting that is generated by the observer rather than by the world.',
      'In cuing studies it is typically driven by a central symbolic cue such as an arrow, and it takes a few hundred milliseconds to reach its full effect.',
      'The lecture summed it up in four words: voluntary, slow, effortful, interruptible.',
      'Exogenous attention is captured by a salient stimulus; this form is directed by the observer\'s goals.',
      'Voluntary, goal-driven attention that you deploy deliberately, associated with the dorsal attention network.'],
    learn:'Voluntary attention directed according to the observer\'s goals (top-down). Characterized as slow to deploy, effortful, sustainable and interruptible. Studied with central symbolic cues (e.g. an arrow) in Posner cuing tasks, and controlled by the dorsal attention network (intraparietal sulcus and frontal eye fields). Contrast with exogenous (reflexive) attention.' },

  { id:'exogenous_attention', answer:'Exogenous attention', aliases:['exogenous','reflexive attention','stimulus-driven attention','bottom-up attention','stimulus driven attention','bottom up attention','reflexive','attentional capture'], cat:'attention', unit:'L4', source:'Lecture 4 study guide',
    clues:[
      'Jonides\'s 1981 chapter showed that a peripheral flash summons it even when observers know the flash is uninformative, which was the first strong evidence that it cannot simply be switched off.',
      'Its benefit peaks within roughly 100–150 ms of a peripheral cue and then fades, and after about 300 ms it reverses into inhibition of return.',
      'The lecture summed it up in four words: involuntary, fast, effortless, disruptive.',
      'Endogenous attention is directed by the observer\'s goals; this form is captured by a salient but task-irrelevant stimulus.',
      'Reflexive, involuntary attention drawn to a sudden or salient event in the environment, associated with the ventral attention network.'],
    learn:'Reflexive attention captured by a salient, often task-irrelevant stimulus (bottom-up). Fast, effortless, involuntary and short-lived; the enhanced processing near the cue is followed by inhibition of return. Studied with peripheral cues (a flash near the target location) in reflexive cuing paradigms, and linked to the ventral attention network. Contrast with endogenous (voluntary) attention.' },

  { id:'spatial_attention', answer:'Spatial attention', aliases:['visual-spatial attention','visuospatial attention','visual spatial attention','spatial selective attention','location-based attention','location based attention','attention to location'], cat:'attention', unit:'L4', source:'Lecture 4 (covert visual-spatial attention)',
    clues:[
      'Its neural signature in early visual cortex is retinotopically specific: in Silver, Ress and Heeger (2007), the region of V1 representing the attended location showed sustained activity throughout a delay period while a peripheral V1 region did not.',
      'Its two main features, as the lecture put it, are preparatory attention (voluntary, covert) and selective processing that is visual and tied to a location.',
      'Because it can be measured with the same physical stimulus attended or ignored, differences in the response can only be due to the observer\'s state.',
      'Feature-based attention selects a property such as motion or color wherever it occurs; this selects a place in the visual field.',
      'Attention directed to a particular location in space, the kind of attention measured in Posner cuing experiments and often described as a spotlight.'],
    learn:'Attention directed to a location in the visual field (or in space generally). Studied with Posner cuing tasks and with sustained-attention designs. Its effects in visual cortex are retinotopically specific: the parts of V1 and extrastriate cortex that represent the attended location show enhanced, sustained activity, even before a target appears. Often described with the spotlight metaphor.' },

  { id:'feature_attention', answer:'Feature-based attention', aliases:['feature based attention','feature attention','attention to features','attention to visual features','feature-based','feature selective attention'], cat:'attention', unit:'L4', source:'Lecture 4 study guide',
    clues:[
      'Treue and Martínez-Trujillo\'s 1999 recordings in monkey MT led to the feature-similarity gain model, and Sáenz, Buracas and Boynton (2002) showed in human fMRI that its effect spreads to stimuli at unattended locations.',
      'Unlike its spatial cousin, it is not tied to a place: it enhances the selected property across the whole visual field.',
      'In the lecture example, attending to motion modulated the human motion area MT/V5, while attending to color modulated ventral V4, for physically identical stimuli.',
      'Spatial attention selects where; this selects what property, such as motion or color.',
      'Attention directed to a particular stimulus attribute (e.g. color, motion, orientation) rather than to a location, which boosts activity in the cortical area specialized for that attribute.'],
    learn:'Selective attention to a stimulus attribute such as motion or color, rather than to a location. Attending to a feature enhances responses in the visual area specialized for it (attend motion: MT/V5; attend color: V4), as shown with fMRI and MEG using physically identical displays, and the enhancement spreads across the visual field rather than being confined to one location.' },

  { id:'posner_cuing', answer:'Posner cuing', aliases:['Posner cueing','Posner cuing task','Posner cueing task','Posner cuing paradigm','Posner cueing paradigm','Posner task','Posner paradigm','cuing paradigm','cueing paradigm','spatial cuing','spatial cueing','cuing experiment','cueing experiment','Posner'], cat:'attention', unit:'L4', source:'Lecture 4 study guide',
    clues:[
      'Michael Posner introduced it in the late 1970s and called the enterprise "mental chronometry": using reaction time to expose mental operations that cannot be seen directly.',
      'In its endogenous version the cue is valid on about 80% of trials, so it pays to trust it; in its exogenous version the cue is uninformative and still works.',
      'Its two key numbers are computed against a neutral cue: the benefit on valid trials and the cost on invalid trials.',
      'An eye tracker measures overt attention; this behavioral method measures covert attention by holding the eyes still and timing responses.',
      'The reaction-time paradigm in which a cue directs attention to a location before a target appears; targets at the cued location are detected faster than targets elsewhere.'],
    learn:'The classic behavioral measure of covert attention (Posner et al., 1978; Posner, 1980). The participant fixates centrally; a cue (a central arrow for endogenous, a peripheral flash for exogenous attention) indicates a likely target location; the target then appears at the cued (valid) or uncued (invalid) location. Reaction times are faster on valid than invalid trials. Compared with a neutral cue, valid cues produce benefits and invalid cues produce costs. The eyes never move, so the effect is attentional, not visual.' },

  { id:'ior', answer:'Inhibition of return', aliases:['IOR','inhibition-of-return'], cat:'attention', unit:'L4', source:'Lecture 4 study guide',
    clues:[
      'Posner and Cohen described it in 1984, and Klein\'s 2000 review in Trends in Cognitive Sciences argued it evolved as a "foraging facilitator" that keeps search from revisiting old ground.',
      'It appears only after reflexive (exogenous) cues; a voluntary central cue does not produce it.',
      'The crossover happens at roughly 300 ms: before that, the cued location is faster; after that, it is slower.',
      'The immediate effect of a peripheral cue is a benefit at the cued location; this is the later reversal, in which the cued location is disadvantaged.',
      'The slowing of responses to targets at a previously cued location when more than about 300 ms have passed since an exogenous cue.'],
    learn:'After an exogenous (reflexive) cue draws attention to a location, the early benefit at that location reverses: from roughly 300 ms onward, targets there are detected more slowly than targets elsewhere. Thought to bias attention toward novel locations and to keep salient but irrelevant events from capturing attention for long, helping keep endogenous and exogenous attention in balance.' },

  { id:'neglect', answer:'Hemispatial neglect', aliases:['neglect','hemineglect','hemi-spatial neglect','unilateral neglect','spatial neglect','visual neglect','hemispatial neglect syndrome','neglect syndrome','left neglect','contralateral neglect'], cat:'lesion', unit:'L4', source:'Lecture 4 study guide',
    clues:[
      'Bisiach and Luzzatti (1978) asked two Milanese patients to describe the Piazza del Duomo from memory; each omitted the left side of the square, and when asked to imagine standing at the opposite end, omitted the other side.',
      'It is not blindness: the visual fields can be intact, yet the patient behaves as if one half of space did not exist, and often denies anything is wrong.',
      'On the bedside tests it is unmistakable: lines are bisected far to the right, the left-side targets on a cancellation sheet go unmarked, and all twelve numbers of a clock face are crowded onto the right.',
      'Extinction is the milder cousin, in which the contralesional stimulus is missed only when a competing stimulus appears on the other side; in this syndrome it is missed even on its own.',
      'The failure to attend to or respond to stimuli on the side of space opposite a brain lesion, typically neglect of the left side after damage to the right hemisphere.'],
    learn:'A syndrome in which the patient fails to attend to, respond to or orient toward stimuli on the side of space opposite the lesion (contralesional), usually the left side after damage to the right hemisphere (especially right inferior parietal cortex and the temporoparietal junction, the territory of the ventral attention network). Tested with line bisection, line cancellation and clock drawing. It is an attentional deficit rather than a sensory one, and it can extend to imagined scenes (representational neglect, Bisiach and Luzzatti, 1978).' },

  { id:'extinction', answer:'Extinction', aliases:['visual extinction','sensory extinction','double simultaneous stimulation','extinction to double simultaneous stimulation'], cat:'lesion', unit:'L4', source:'Lecture 4 (neglect examination)',
    clues:[
      'Morris Bender\'s 1952 monograph established the bedside test still used today and called the phenomenon "extinction to double simultaneous stimulation."',
      'It can be found in touch and hearing as well as vision, which argues that it is a disorder of attention rather than of any one sense.',
      'It is checked in the attention section of the mental status exam: the examiner wiggles a finger on the left, then on the right, then both at once.',
      'Neglect is the failure to notice the left side even when nothing competes with it; this is the failure to notice it only when something appears on the right at the same time.',
      'A milder form of neglect in which a patient detects a single stimulus on the affected side but misses it when a second stimulus is presented simultaneously on the unaffected side.'],
    learn:'A sign of attentional impairment after (usually right-hemisphere) damage: a patient can detect a single stimulus on the contralesional (usually left) side, but when stimuli are presented on both sides at once, only the ipsilesional one is reported. It is tested with double simultaneous stimulation during the neurological exam and is considered a mild form of neglect, showing that the deficit is one of competition for attention rather than of sensation.' },

  { id:'line_bisection', answer:'Line bisection', aliases:['line bisection test','line bisection task','bisection','line-bisection'], cat:'lesion', unit:'L4', source:'Lecture 4 (neglect examination)',
    clues:[
      'Schenkenberg, Bradford and Ajax standardized it in 1980 with lines of several lengths placed left, center and right on the page, and found errors grow with line length.',
      'Its companion tests are line cancellation, in which the patient crosses out every line on a cluttered page, and clock drawing.',
      'The error is a deviation of the mark toward the side of the lesion, away from the neglected side.',
      'Cancellation tests count how many targets are missed; this test measures how far the patient\'s sense of the midpoint has shifted.',
      'The bedside test for neglect in which the patient marks the middle of a horizontal line; patients with left neglect mark far to the right of center.'],
    learn:'A standard clinical test for hemispatial neglect. The patient is asked to mark the midpoint of a horizontal line; a patient with left neglect places the mark well to the right of center, as if the left part of the line were not there. Used alongside line cancellation (crossing out all targets on a page) and clock drawing.' },

  { id:'dan', answer:'Dorsal attention network', aliases:['DAN','dorsal network','dorsal frontoparietal network','dorsal attention system','dorsal fronto-parietal network'], cat:'attention', unit:'L4', source:'Lecture 4 study guide',
    clues:[
      'Corbetta and Shulman proposed it in 2002 by noticing that the frontoparietal regions active during cued attention tasks in PET and fMRI were reliably distinct from those active when an unexpected target appeared.',
      'Its two core nodes are the intraparietal sulcus and the frontal eye fields, and it is organized bilaterally and largely retinotopically.',
      'Hopfinger, Buonocore and Mangun (2000) caught it in action: cue-related activity in frontal and parietal cortex preceded the modulation of visual cortex before any target appeared.',
      'The ventral attention network reorients you to something unexpected; this one keeps you focused on what you chose.',
      'The bilateral frontoparietal system for voluntary, goal-directed (endogenous) attention: focusing and sustaining attention on a chosen location or feature.'],
    learn:'A bilateral frontoparietal network centered on the intraparietal sulcus (IPS) and frontal eye fields (FEF), proposed by Corbetta and Shulman (2002). It is the source of top-down, endogenous (voluntary) attention: it prepares for and sustains attention on chosen locations and features and sends biasing signals to sensory cortex (the sites of attention). Contrast with the ventral attention network.' },

  { id:'van', answer:'Ventral attention network', aliases:['VAN','ventral network','ventral frontoparietal network','ventral attention system','ventral fronto-parietal network','reorienting network'], cat:'attention', unit:'L4', source:'Lecture 4 study guide',
    clues:[
      'Corbetta and Shulman likened it to a "circuit breaker" that interrupts the dorsal network, and its lateralization to the right hemisphere is their explanation for why neglect follows right- but rarely left-sided lesions.',
      'Its core nodes are the temporoparietal junction and ventral frontal cortex, and unlike its dorsal partner it is not retinotopically organized.',
      'It responds to salient, unexpected, behaviorally relevant events, especially targets that appear where attention was not directed.',
      'The dorsal attention network sustains attention where you have aimed it; this one yanks attention to something you did not expect.',
      'The right-lateralized system for stimulus-driven (exogenous) attention: reorienting attention to salient or unexpected events, and damaged in hemispatial neglect.'],
    learn:'A right-lateralized network including the temporoparietal junction (TPJ) and ventral frontal cortex (VFC), proposed by Corbetta and Shulman (2002). It supports stimulus-driven, exogenous reorienting of attention to salient and unexpected events, acting as a circuit breaker on the dorsal network. Damage to its right-hemisphere nodes is associated with hemispatial neglect. Contrast with the dorsal attention network.' },

  { id:'lfp', answer:'Local field potential', aliases:['LFP','LFPs','local field potentials','field potential'], cat:'methods', unit:'L4', source:'Lecture 4 (effects of attention on neural activity)',
    clues:[
      'Its low-frequency components mostly reflect summed synaptic currents rather than spikes, which is why it can be recorded from the cortical surface with an electrode grid (ECoG) without penetrating the tissue.',
      'In the study shown in lecture, the 60–80 Hz gamma band of this signal was used as a marker of feedforward processing in visual cortex.',
      'Attention increased the gamma-band coherence of this signal between V1 and V4 for the neurons representing the attended stimulus, suggesting that attention routes information up the hierarchy by synchronizing areas.',
      'A single-unit recording captures the spikes of one neuron; this captures the summed electrical activity of the local population, essentially EEG measured on the brain itself.',
      'The population-level electrical signal recorded from an electrode in or on cortex, whose gamma-band synchrony between visual areas increases with attention.'],
    learn:'The summed extracellular electrical activity of a local population of neurons, recorded from an electrode in or on the cortex (essentially EEG at the surface of the brain). Its oscillations are analyzed by frequency band; gamma (60–80 Hz) reflects feedforward processing in visual cortex. The lecture\'s example: in monkeys attending to one of two gratings, gamma-band coherence between V1 and V4 increased for the attended stimulus, showing that attention alters effective connectivity to route relevant information.' },

  { id:'v4', answer:'Area V4', aliases:['V4','visual area V4','extrastriate area V4','ventral V4','V4v'], cat:'anatomy', unit:'L4', source:'Lecture 4 (animal model of attention)',
    clues:[
      'Zeki first mapped it in the macaque in the early 1970s and argued it was the cortical color center, a claim that has been debated ever since.',
      'Its receptive fields are large enough to hold two stimuli at once, which is exactly what made the classic 1985 experiment possible.',
      'Moran and Desimone (1985) found that when a monkey attended to one of two stimuli inside a neuron\'s receptive field, the response to the ignored stimulus was sharply reduced, as if the receptive field had shrunk around the attended one.',
      'MT/V5 is the extrastriate area modulated by attention to motion; this ventral extrastriate area is modulated by attention to color.',
      'The extrastriate visual area, downstream of V1 and V2, where Moran and Desimone first showed that attention modulates single neurons\' responses.'],
    learn:'An extrastriate visual area in the ventral stream, involved in color and shape processing. Moran and Desimone (1985) showed in monkeys that attention modulates its neurons: with two stimuli in a receptive field, the response to the unattended one was suppressed. In humans, ventral V4 is modulated by attention to color, and gamma-band coherence between V1 and V4 increases with attention.' },

  { id:'p1', answer:'P1 component', aliases:['P1','P1 wave','P1 effect','P1 attention effect','the P1','P100','sensory ERP'], cat:'methods', unit:'L4', source:'Lecture 4 (effects of attention on neural activity)',
    clues:[
      'Its enhancement by attention was a central finding of Hillyard and Mangun\'s work in the 1980s and 1990s, and its early latency was the main evidence for "early selection" in the ERP literature.',
      'It peaks at roughly 100 ms after a visual stimulus over lateral occipital electrodes, and it is followed by the N1.',
      'In the sustained-attention design shown in lecture, the same flash evoked a larger version of it when it appeared at the attended location than when it was ignored.',
      'Later components index decision and memory processes; this early positive wave indexes sensory processing, which is why its modulation shows attention acting at an early stage.',
      'The early positive ERP wave over visual cortex whose amplitude is larger for stimuli at attended locations, evidence that attention amplifies sensory processing.'],
    learn:'A positive ERP component peaking about 100 ms after a visual stimulus over occipital scalp. Its amplitude is larger when the eliciting stimulus appears at an attended location than when the identical stimulus is ignored, showing that spatial attention acts as a sensory gain control at an early stage of visual processing. The negative N1 that follows it shows the same effect.' },

  { id:'preparatory_attention', answer:'Preparatory attention', aliases:['baseline shift','delay period activity','delay-period activity','anticipatory attention','preparatory activity','attentional baseline shift','pretarget activity','pre-target activity','sustained attention'], cat:'attention', unit:'L4', source:'Lecture 4 (Silver et al., 2007; Hopfinger et al., 2000)',
    clues:[
      'Kastner and colleagues (1999) called its fMRI signature a "baseline increase" and Luck and colleagues (1997) saw it in the spontaneous firing of V2 and V4 neurons before any stimulus appeared.',
      'It is strongest in the cortical representation of the attended location and absent from representations of the periphery, even when the target has not yet appeared.',
      'Silver, Ress and Heeger (2007) had subjects hold attention at a location across a variable delay and found sustained activity in the corresponding region of V1 throughout the wait.',
      'Target-evoked modulation is attention acting on a stimulus that is present; this is attention acting on visual cortex before the stimulus arrives.',
      'The sustained, voluntary, covert deployment of attention to a location in advance of a target, visible as elevated activity in retinotopic visual cortex before anything appears there.'],
    learn:'Attention deployed in advance of a stimulus. In fMRI, holding attention at a location during a delay period produces sustained activity in the retinotopically corresponding regions of visual cortex (including V1) before any target appears, and this activity is spatially specific (attended region yes, peripheral unattended region no). Hopfinger et al. (2000) showed that cue-related frontoparietal activity precedes this visual-cortex modulation. Illustrates the sources (control networks) vs. sites (sensory cortex) distinction.' },

  { id:'eye_tracking', answer:'Eye tracking', aliases:['eyetracking','eye tracker','eye-tracking','eye tracker','eye movement recording','eye movement tracking','oculomotor recording'], cat:'methods', unit:'L4', source:'Lecture 4 (measuring overt attention)',
    clues:[
      'Yarbus\'s 1967 recordings with suction-cup contact lenses showed that the same painting is scanned completely differently depending on the question the viewer has been asked.',
      'Modern video-based systems locate the pupil and the reflection of an infrared light on the cornea, and use the geometry between them to compute gaze direction.',
      'It reveals a pattern of fixations lasting a few hundred milliseconds each, separated by fast saccades, rather than a smooth sweep.',
      'Posner cuing measures covert attention while the eyes are held still; this method measures overt attention by recording where the eyes go.',
      'The method of recording where a person is looking, used to measure overt attention.'],
    learn:'Recording gaze position over time, usually with a video camera that tracks the pupil and a corneal reflection. Because overt attention involves moving the eyes to the attended location, eye tracking measures it directly, revealing fixations and saccades. In covert-attention experiments it serves the opposite purpose: confirming that the eyes stayed on the fixation point.' },

  { id:'change_blindness', answer:'Change blindness', aliases:['change detection','change-blindness','flicker paradigm'], cat:'attention', unit:'L4', source:'Lecture 4 (how much reaches awareness?)',
    clues:[
      'Simons and Levin (1998) had an experimenter ask pedestrians for directions and swapped in a different person while a door was carried between them; about half never noticed.',
      'It largely disappears if the change occurs without a global disruption, because the local motion signal of the change captures attention by itself.',
      'In the flicker paradigm, a scene alternates with a changed version, separated by a brief blank, and large changes can go unnoticed for many seconds.',
      'Inattentional blindness is failing to see an unexpected object in plain view; this is failing to see that something already in view has changed.',
      'The failure to notice even large changes in a visual scene when the change coincides with a brief interruption, showing how little of what stimulates the retina reaches awareness without attention.'],
    learn:'The failure to detect changes in a scene when the transient produced by the change is masked (by a blank, an eye movement, a cut or a flicker). Demonstrates that only attended parts of a scene are encoded richly enough to notice a change, and that far less of what stimulates the receptors reaches awareness than it feels like. Used in lecture as an opening demonstration of the need for selective attention.' },

  { id:'visual_search', answer:'Visual search', aliases:['search','searching','visual search task','search task'], cat:'attention', unit:'L4', source:'Lecture 4 (Wolfe & Horowitz, 2017)',
    clues:[
      'Treisman and Gelade\'s 1980 feature integration theory divided it into a parallel stage, in which single features pop out, and a serial stage, in which attention is needed to bind features into objects.',
      'Its efficiency is measured as the slope of reaction time against the number of items in the display, in milliseconds per item.',
      'Wolfe and Horowitz (2017) listed five factors that guide it: bottom-up salience, top-down feature guidance, scene structure and meaning, the previous history of search, and the relative value of targets and distractors.',
      'A Posner cuing task tells attention where to go; in this task, attention must find the target on its own among distractors.',
      'Looking for a target object among distractors, as when hunting for a toothbrush in a cluttered scene; it involves directing attention to candidate objects one after another.'],
    learn:'The task of finding a target among distractors. Search involves directing attention to objects that might be the target, and its efficiency depends on what guides attention. Wolfe and Horowitz (2017) identified five guiding factors: bottom-up salience, top-down feature guidance, scene structure and meaning, previous history of search, and the relative value of targets and distractors.' },

  /* ---------------------------- LECTURE 5 ---------------------------- */
  { id:'encoding', answer:'Encoding', aliases:['encoding stage','encode'], cat:'memory', unit:'L5', source:'Lecture 5 study guide',
    clues:[
      'Craik and Lockhart\'s 1972 levels-of-processing framework argued that how well it works depends on depth: judging a word\'s meaning beats judging its typeface.',
      'In the lecture\'s scheme it has two parts: acquisition, the sensory registration of the input, and consolidation, its strengthening over time.',
      'Imaging showed that the hippocampus and medial temporal lobe are engaged during this stage as well as at retrieval, and activity here predicts what will later be remembered.',
      'Retrieval gets information back out of memory; this is the first stage, getting it in.',
      'The first stage of memory: taking in and initially processing new information so that it can be stored.'],
    learn:'The first of the three stages of learning and memory (encoding, storage, retrieval). In the lecture\'s scheme it includes acquisition (sensory registration of the input) and consolidation (strengthening over time). Deeper, meaning-based processing produces better memory (levels of processing), and the subsequent memory paradigm studies encoding by sorting brain activity recorded at study according to later memory. The hippocampus and medial temporal lobe are engaged during encoding as well as retrieval.' },

  { id:'storage', answer:'Storage', aliases:['storage stage','retention'], cat:'memory', unit:'L5', source:'Lecture 5 study guide',
    clues:[
      'Ebbinghaus\'s 1885 "savings" measure revealed it even when recall failed: relearning a forgotten list of nonsense syllables took fewer repetitions than learning it the first time.',
      'The lecture lists consolidation under this stage as well as under encoding, because traces keep being strengthened and reorganized long after learning.',
      'Plato pictured it as an impression pressed into a block of wax in the soul, lasting as long as the image lasts: the lecture\'s "classical view" of memory.',
      'Encoding gets information in and retrieval gets it out; this is the stage in between.',
      'The second stage of memory: the maintenance of acquired information over time.'],
    learn:'The middle stage of learning and memory: maintaining encoded information over time, between encoding and retrieval. Consolidation (the strengthening and reorganization of memory traces) continues during storage. Information can remain stored even when it cannot be recalled, as Ebbinghaus\'s savings method and cued-recall studies show.' },

  { id:'retrieval', answer:'Retrieval', aliases:['retrieval stage','retrieve','retrieving'], cat:'memory', unit:'L5', source:'Lecture 5 study guide',
    clues:[
      'Tulving and Pearlstone (1966) showed that category cues brought back words that free recall had missed, separating what is available in memory from what is accessible.',
      'For recognition it can take two forms: re-experiencing the original event with its details, or a bare feeling that the item is old.',
      'Scanning people during this stage, while they judged words as old or new, showed hippocampal activity only for items they truly recollected, not for those that merely felt familiar.',
      'Encoding gets information into memory; this is the final stage, getting it back out.',
      'The third stage of memory: accessing stored information when it is needed.'],
    learn:'The final stage of learning and memory: accessing stored information. Recognition can be based on recollection (retrieving the episode with its details) or familiarity (a feeling of pastness without detail). Information can be stored but inaccessible, as when a cue brings back what free recall missed. The hippocampus and medial temporal lobe are involved in retrieval as well as encoding, the hippocampus specifically for recollection.' },

  { id:'consolidation', answer:'Consolidation', aliases:['systems consolidation','synaptic consolidation','consolidate'], cat:'memory', unit:'L5', source:'Lecture 5 (stages of learning and memory)',
    clues:[
      'Müller and Pilzecker coined the term in 1900, after finding that learning a second list soon after the first impaired memory for the first, as if the earlier trace had not yet set.',
      'It works at two scales: within hours at individual synapses, which requires new protein synthesis, and over weeks to years across brain regions.',
      'Temporally graded retrograde amnesia, in which older memories survive while recent ones are lost, was the lecture\'s main evidence that memories keep changing after they are first learned.',
      'Acquisition first registers the information; this is the slower process that strengthens and stabilizes the trace afterward.',
      'The strengthening and stabilizing of a memory over time after it is first acquired, listed in the lecture under both encoding and storage.'],
    learn:'The process by which a newly acquired memory is strengthened and stabilized over time. Synaptic consolidation takes hours and depends on protein synthesis; systems consolidation takes weeks to years and involves reorganization between the hippocampus and neocortex. Temporally graded retrograde amnesia is evidence for it. How systems consolidation works is debated: the standard consolidation theory says memories eventually become independent of the hippocampus, while the transformation hypothesis says detailed episodic memories always need it.' },

  { id:'sensory_memory', answer:'Sensory memory', aliases:['sensory store','sensory register','sensory buffer','sensory memories'], cat:'memory', unit:'L5', source:'Lecture 5 study guide',
    clues:[
      'Sperling\'s 1960 partial-report experiments showed that observers briefly hold most of a 12-letter display, but that the trace fades within about a second, faster than they can report it.',
      'It has a large capacity but lasts only milliseconds to a few seconds, and each modality has its own; Neisser (1967) called the visual one iconic and the auditory one echoic.',
      'Its auditory form explains the "…sure I heard you…you said…" moment: you can replay the last second or two of speech you were not really listening to.',
      'Short-term memory holds information for seconds to minutes; this is the even briefer, modality-specific trace that comes before it.',
      'The briefest form of memory, lasting milliseconds to seconds: a high-capacity record of what just stimulated the receptors, iconic for vision and echoic for hearing.'],
    learn:'The briefest memory store, lasting from milliseconds to a few seconds: a high-capacity, modality-specific record of sensory input. Its visual form is called iconic memory and its auditory form echoic memory (Neisser, 1967). Sperling\'s partial-report experiments (1960) showed that much more is briefly available than can be reported before the trace fades. Contrast with short-term and working memory.' },

  { id:'short_term_memory', answer:'Short-term memory', aliases:['STM','primary memory','immediate memory','short-term store'], cat:'memory', unit:'L5', source:'Lecture 5 study guide',
    clues:[
      'Peterson and Peterson (1959) found that when rehearsal was blocked by counting backward by threes, recall of three consonants fell to about 10% within 18 seconds.',
      'Miller\'s 1956 paper put its capacity at "seven, plus or minus two" items, and grouping items into chunks lets each slot carry more information.',
      'The lecture\'s example is a phone number (867-5309) kept in mind by repeating it, an ability that amnesic patients like H.M. and Clive Wearing still have.',
      'Working memory adds active manipulation of what is held; this is the simple holding of information for seconds to minutes.',
      'The limited-capacity store that holds information for seconds to a minute or so, such as a phone number you repeat until you dial it.'],
    learn:'A limited-capacity store that holds a small amount of information for seconds to minutes, usually kept alive by rehearsal (William James\'s "primary memory"). Its capacity is classically about seven items (Miller, 1956), and without rehearsal its contents fade within seconds (Peterson and Peterson, 1959). It is intact in medial temporal lobe amnesia, which instead impairs the formation of lasting new memories. Contrast with sensory memory (briefer) and working memory (active manipulation).' },

  { id:'working_memory', answer:'Working memory', aliases:['WM'], cat:'memory', unit:'L5', source:'Lecture 5 study guide',
    clues:[
      'Baddeley and Hitch\'s 1974 model split it into a central executive and two slave systems, a phonological loop and a visuospatial sketchpad; an episodic buffer was added in 2000.',
      'Its contents last only as long as they are actively maintained, its capacity is a handful of items, and it depends heavily on prefrontal and parietal cortex.',
      'The lecture defined it by one word, manipulation: holding information in mind while doing something with it, for seconds to minutes.',
      'Short-term memory passively holds a phone number; this holds it while you operate on it, such as adding the digits or reversing their order.',
      'The short-duration system for holding and manipulating information in mind to guide ongoing thought, as in mental arithmetic.'],
    learn:'A limited-capacity system for temporarily holding and manipulating information in the service of ongoing tasks (mental arithmetic, following directions, comparing options). In Baddeley and Hitch\'s (1974) model it includes a central executive that controls attention, a phonological loop, a visuospatial sketchpad and (since 2000) an episodic buffer. It depends heavily on prefrontal and parietal cortex. Contrast with short-term memory, which emphasizes storage rather than manipulation.' },

  { id:'episodic_memory', answer:'Episodic memory', aliases:['episodic','event memory','episodic memories'], cat:'memory', unit:'L5', source:'Lecture 5 study guide',
    clues:[
      'Endel Tulving drew the distinction that defines it in 1972, and later described it as "mental time travel," accompanied by a self-knowing (autonoetic) awareness.',
      'Each memory is bound to its context, the what, where and when of a single occasion, which makes it the kind most vulnerable to hippocampal damage.',
      'Sue Corkin reported that H.M. could tell you about his schools and his love of roller skating, but could not give a single detailed memory of one particular occasion, with one exception.',
      'Semantic memory is knowing that Paris is the capital of France; this is remembering your own trip there.',
      'Long-term memory for personal experiences tied to a specific time and place, such as the details of your 8th birthday party.'],
    learn:'Long-term declarative memory for personally experienced events, bound to their context (what happened, where and when). Tulving (1972) distinguished it from semantic memory. It is especially dependent on the hippocampus: H.M. retained general knowledge from before his surgery but could not recall specific past episodes in detail, which the transformation hypothesis takes as evidence that detailed episodic memories always require the hippocampus.' },

  { id:'semantic_memory', answer:'Semantic memory', aliases:['semantic knowledge','fact memory','factual memory'], cat:'memory', unit:'L5', source:'Lecture 5 study guide',
    clues:[
      'Collins and Quillian\'s 1969 model stored it as a hierarchy, predicting correctly that people verify "a canary can sing" faster than "a canary has skin."',
      'A neurodegenerative syndrome centered on the anterior temporal lobes erodes it progressively, so patients lose the meanings of words and objects while memory for recent events is relatively spared.',
      'H.M. kept plenty of it from before his surgery: he could tell you about the 1929 stock market crash and many public events.',
      'Episodic memory is remembering your trip to Paris; this is simply knowing that Paris is the capital of France.',
      'Long-term memory for facts and general knowledge about the world, independent of when and where you learned it, such as the capitals of countries.'],
    learn:'Long-term declarative memory for facts, concepts and general knowledge, not tied to the occasion on which it was learned (Tulving, 1972). Examples: word meanings, the capitals of countries. H.M. retained much semantic knowledge acquired before his surgery. On the transformation hypothesis, episodic memories become more semantic-like (gist without context) over time as the neocortex develops schematic versions of them.' },

  { id:'procedural_memory', answer:'Procedural memory', aliases:['procedural','procedural learning','skill learning','motor skill learning','skill memory','habit learning','habit memory','procedural memories'], cat:'memory', unit:'L5', source:'Lecture 5 study guide',
    clues:[
      'Knowlton, Mangels and Squire (1996) found that patients with Parkinson\'s disease failed to pick up a probabilistic "weather prediction" habit that amnesic patients learned normally, tying it to the striatum.',
      'It builds up gradually with practice and shows itself in faster, smoother performance of a motor or perceptual routine, rather than in anything you can consciously recall.',
      'Clive Wearing can still play the piano and conduct a choir, and H.M. improved at tracing a star in a mirror over three days while denying he had ever done it.',
      'Episodic and semantic memories can be put into words; this kind, knowing how rather than knowing that, mostly cannot.',
      'Long-term memory for how to do things, such as riding a bike or snowboarding, built up by practice and spared in amnesia.'],
    learn:'Long-term nondeclarative memory for skills and habits ("knowing how"), such as riding a bike, playing an instrument or typing. It is acquired gradually through practice, expressed through performance rather than conscious recollection, and depends on the striatum (basal ganglia), cerebellum and motor cortex rather than the medial temporal lobe. It is preserved in amnesia: H.M. improved at mirror tracing across days, and Clive Wearing can still play the piano and conduct.' },

  { id:'conditioning', answer:'Conditioning', aliases:['classical conditioning','Pavlovian conditioning','fear conditioning','Pavlovian','conditioned response','eyeblink conditioning','associative conditioning'], cat:'memory', unit:'L5', source:'Lecture 5 study guide',
    clues:[
      'Bechara and colleagues (1995) found a double dissociation in it: a patient with amygdala damage knew which slide predicted a loud horn yet showed no skin-conductance response to it, while a patient with hippocampal damage showed the reverse.',
      'Its eyeblink version, in which a tone comes to predict a puff of air to the eye, depends on the cerebellum (McCormick and Thompson, 1984).',
      'The lecture\'s example: developing a fear of dogs after being bitten by one.',
      'Procedural memory is a learned how-to; this is a learned association, in which one stimulus comes to predict another and trigger a response.',
      'A long-duration form of nondeclarative memory in which a neutral stimulus, after pairing with a meaningful one, comes to evoke a response on its own, as with Pavlov\'s dogs.'],
    learn:'Learning an association between stimuli, as in classical (Pavlovian) conditioning: a neutral stimulus paired with a biologically significant one comes to evoke a conditioned response. A form of nondeclarative memory that can be preserved in amnesia. Emotional (fear) conditioning depends on the amygdala, and conditioning of skeletal responses such as the eyeblink depends on the cerebellum. The lecture\'s example: fear of dogs after being bitten.' },

  { id:'priming', answer:'Priming', aliases:['repetition priming','priming effect','primed'], cat:'memory', unit:'L5', source:'Lecture 5 study guide',
    clues:[
      'Schacter and Buckner (1998) linked it to "repetition suppression": reduced fMRI activity for a repeated item in the very cortical regions that process it, as if processing had become more efficient.',
      'It can follow a single exposure, outlasts short-term memory, and happens with no intent to remember and often no awareness of the earlier encounter.',
      'In the lecture, amnesic patients showed both of its forms, perceptual and conceptual, normally, despite failing tests of recall.',
      'Recognition is consciously judging that you have seen an item before; this is an unconscious boost in processing an item because you have.',
      'An intermediate-duration form of nondeclarative memory: easier processing of a stimulus because of a recent encounter with it or something related, even without awareness.'],
    learn:'A change in the processing of a stimulus caused by prior exposure to the same or a related stimulus, usually without awareness of the earlier encounter. Perceptual priming depends on the form of the stimulus; conceptual priming depends on its meaning. It is a form of nondeclarative memory preserved in amnesia (e.g. normal word-stem completion despite impaired recall), and it is associated with reduced activity (repetition suppression) in the cortical regions that process the item.' },

  { id:'perceptual_priming', answer:'Perceptual priming', aliases:['visual priming','form-based priming','perceptual repetition priming'], cat:'memory', unit:'L5', source:'Lecture 5 (forms of memory)',
    clues:[
      'Gabrieli and colleagues (1995) described patient M.S., whose right occipital lesion abolished it for visually presented words while his recognition memory stayed normal, the mirror image of amnesia.',
      'It is sensitive to surface form: changing modality (hearing a word at study, seeing it at test) or typeface reduces it, but thinking hard about the item\'s meaning does little to increase it.',
      'The lecture\'s example: you recognize an object more easily because you saw that object, or a similar one, recently; word-stem completion is a classic test of it.',
      'Conceptual priming depends on meaning; this kind depends on what a stimulus looks or sounds like.',
      'Priming based on the form of a stimulus: easier identification of an item because you recently saw or heard the same or a similar one.'],
    learn:'Priming that depends on the physical (sensory) form of a stimulus: having recently seen or heard an item makes it easier to identify again, even without remembering the earlier encounter. It is largely modality-specific, is tested with tasks such as word-stem completion and perceptual identification, is preserved in amnesia, and depends on sensory cortex rather than the medial temporal lobe. Contrast with conceptual priming.' },

  { id:'conceptual_priming', answer:'Conceptual priming', aliases:['semantic priming','meaning-based priming','conceptual repetition priming'], cat:'memory', unit:'L5', source:'Lecture 5 (forms of memory)',
    clues:[
      'It is usually measured with tasks such as generating examples of a category or answering general-knowledge questions, and unlike its perceptual cousin it grows when studied items are processed for meaning.',
      'It transfers across modalities and formats: hearing a word can speed a later decision about a picture of the same thing.',
      'The lecture\'s example: an object is recognized more easily because it was mentioned earlier, as when hearing "dog" or "animal" helps you identify a dog.',
      'Perceptual priming depends on what a stimulus looks or sounds like; this kind depends on what it means.',
      'Priming based on meaning: easier processing of an item because something related in meaning was encountered recently, regardless of physical form.'],
    learn:'Priming based on meaning rather than physical form: a prior encounter with a word, picture or idea makes related meaning-based processing easier (e.g. hearing "dog" speeds recognition of a dog picture or of the concept "animal"). It transfers across modalities, benefits from meaning-based study, and is preserved in amnesia. Contrast with perceptual priming.' },

  { id:'declarative_memory', answer:'Declarative memory', aliases:['explicit memory','declarative','explicit','declarative knowledge'], cat:'memory', unit:'L5', source:'Lecture 5 (can amnesic patients learn?)',
    clues:[
      'Cohen and Squire (1980) borrowed the philosopher Gilbert Ryle\'s distinction between "knowing that" and "knowing how" to name it, after amnesic patients learned to read mirror-reversed words they could not remember having seen.',
      'Its contents can be consciously brought to mind and stated, and it comes in two forms, memory for events and memory for facts.',
      'Medial temporal lobe amnesics like H.M. fail to acquire new knowledge of this kind, even though their procedural learning and priming are preserved.',
      'Implicit forms of memory are expressed through performance without awareness; this kind can be consciously recalled and put into words.',
      'Long-term memory that can be consciously recalled and verbally reported, comprising episodic and semantic memory and depending on the medial temporal lobe.'],
    learn:'Long-term memory that is accessible to conscious recollection and can be "declared": episodic memory (events) and semantic memory (facts). Also called explicit memory. It depends on the medial temporal lobe (hippocampus and surrounding cortex) and the diencephalon, and it is what is lost in amnesia. Contrast with nondeclarative memory.' },

  { id:'nondeclarative_memory', answer:'Nondeclarative memory', aliases:['non-declarative memory','implicit memory','nondeclarative','non-declarative','implicit','implicit learning','nondeclarative learning','non-declarative learning'], cat:'memory', unit:'L5', source:'Lecture 5 (can amnesic patients learn?)',
    clues:[
      'Kandel\'s studies of habituation and sensitization of the gill-withdrawal reflex in the sea slug Aplysia (Nobel Prize, 2000) explored its simplest, nonassociative form.',
      'It is an umbrella for systems with different neural bases: the striatum for habits, sensory cortex for priming, the amygdala and cerebellum for conditioning, and reflex pathways for nonassociative learning.',
      'The lecture\'s answer to "Can amnesic patients learn?" was yes, this kind: procedural learning, perceptual and conceptual priming, and conceptual learning.',
      'Explicit memory can be consciously recalled and stated; this kind is expressed through changes in performance without awareness of what was learned.',
      'Long-term memory expressed through performance rather than conscious recollection, including skills, priming and conditioning, and largely spared in amnesia.'],
    learn:'Memory that is expressed through behavior without conscious access to its content (also called implicit memory). It includes procedural memory (skills and habits; striatum), priming (sensory and association cortex), classical conditioning (amygdala, cerebellum) and nonassociative learning such as habituation (reflex pathways). These forms are preserved in medial temporal lobe amnesia, the main evidence that they are separate from declarative memory.' },

  { id:'anterograde_amnesia', answer:'Anterograde amnesia', aliases:['anterograde','anterograde memory loss'], cat:'lesion', unit:'L5', source:'Lecture 5 study guide',
    clues:[
      'Claparède (1911) pricked a patient with this condition using a pin hidden in his hand; minutes later she had forgotten it, yet pulled her hand back when he reached for it again, unable to say why.',
      'Patients can hold a conversation and keep a number in mind by rehearsing it, but the information is gone soon after their attention moves on.',
      'After his 1953 surgery H.M. had it permanently, and in the lecture\'s prose-recall data such patients forgot a story within minutes despite intact short-term memory.',
      'Retrograde amnesia erases memories from before the brain damage; this blocks forming new ones after it.',
      'The inability to form new long-term memories after the brain injury or illness that caused the amnesia.'],
    learn:'Amnesia for events after the onset of the brain damage (the "insult"): the inability to form new lasting declarative memories, while short-term memory, intelligence and previously learned skills can be intact. Caused by bilateral damage to the medial temporal lobe or diencephalon (e.g. H.M.\'s surgery, herpes simplex encephalitis, Korsakoff\'s syndrome, anoxia). Nondeclarative learning such as procedural learning and priming is preserved. Contrast with retrograde amnesia.' },

  { id:'retrograde_amnesia', answer:'Retrograde amnesia', aliases:['retrograde','temporally graded amnesia','temporally graded retrograde amnesia','retrograde memory loss'], cat:'lesion', unit:'L5', source:'Lecture 5 study guide',
    clues:[
      'Ribot\'s 1881 "law of regression" described its usual pattern: the newest memories go first and the oldest are the most resistant.',
      'A concussion can produce a brief version of it, wiping out the minutes before the blow, while a course of electroconvulsive therapy can reach back months or more.',
      'In the lecture\'s data it was temporally graded: older memories were well preserved and more recent ones less so, the key evidence for consolidation.',
      'Anterograde amnesia blocks forming new memories after the damage; this erases memories formed before it.',
      'The loss of memories acquired before the brain injury or illness that caused the amnesia.'],
    learn:'Amnesia for information acquired before the onset of brain damage. It is often temporally graded (Ribot\'s law): remote memories are better preserved than recent ones, which suggests that memories change, or consolidate, after initial learning. Its extent ranges from minutes (concussion) to years or decades. Contrast with anterograde amnesia; most amnesic patients, including H.M. and Clive Wearing, have some of both.' },

  { id:'korsakoff', answer:'Korsakoff\'s syndrome', aliases:['Korsakoff syndrome','Korsakoff','Korsakoffs','Korsakoff amnesia','Korsakoff\'s amnesia','Korsakoff\'s disease','Korsakov syndrome','Korsakov\'s syndrome','Korsakov'], cat:'lesion', unit:'L5', source:'Lecture 5 (causes of amnesic syndrome)',
    clues:[
      'The Russian psychiatrist who described it in 1887 later named it a "polyneuritic psychosis," because it came with damage to the peripheral nerves.',
      'Besides amnesia, its hallmark is confabulation: confidently reporting false memories with no intent to deceive.',
      'The lecture listed it as a cause of amnesia from thiamine (vitamin B1) deficiency, which damages the thalamus and mammillary bodies.',
      'H.M.\'s amnesia came from removal of medial temporal lobe tissue; this amnesia comes from damage to diencephalic structures, usually after years of heavy drinking.',
      'An amnesic syndrome caused by thiamine deficiency, most often in chronic alcoholism, with profound anterograde amnesia and confabulation.'],
    learn:'A chronic amnesic syndrome caused by thiamine (vitamin B1) deficiency, most often with chronic alcohol use, damaging the mammillary bodies and medial thalamus. Features include severe anterograde amnesia, some retrograde amnesia, and confabulation. Like other amnesic patients, people with Korsakoff\'s syndrome show preserved nondeclarative learning, such as implicit sequence learning (Nissen et al., 1989). Described by Sergei Korsakoff in 1887.' },

  { id:'hippocampus', answer:'Hippocampus', aliases:['hippocampi','hippocampal formation','hippocampal','hippocampus proper','HC'], cat:'anatomy', unit:'L5', source:'Lecture 5 study guide', lab:'MRI_Explorer.html',
    clues:[
      'Aranzi named it in 1587, comparing its curled shape to a seahorse (and, less memorably, to a white silkworm).',
      'Patient R.B. (Zola-Morgan, Squire and Amaral, 1986) became amnesic after an ischemic episode, and his autopsy found damage confined to its CA1 field, showing that a lesion of this structure alone is enough.',
      'Largely removed on both sides in H.M., it is needed for recollection but not familiarity, and its place cells fire when a rat is in one particular location.',
      'The perirhinal cortex next to it supports familiarity; this structure supports recollection of the episode itself.',
      'The curved structure in the medial part of the temporal lobe that is essential for forming new episodic memories.'],
    learn:'A curved, seahorse-shaped structure in the medial temporal lobe, along the floor of the lateral ventricle\'s temporal horn. It is essential for forming new declarative (especially episodic) memories, supports recollection rather than familiarity, contains place cells, and is reciprocally connected with widespread neocortex, mainly via the entorhinal cortex. Bilateral removal of much of it (with surrounding cortex and amygdala) caused H.M.\'s amnesia.' },

  { id:'mtl', answer:'Medial temporal lobe', aliases:['MTL','medial temporal lobes','medial temporal lobe memory system','MTL memory system','medial temporal cortex','medial temporal'], cat:'anatomy', unit:'L5', source:'Lecture 5 study guide', lab:'MRI_Explorer.html',
    clues:[
      'Mishkin (1978) showed that in monkeys, removing the hippocampus and amygdala together produced a far worse recognition deficit than removing either alone; later work traced much of the effect to the adjacent cortex.',
      'It includes the hippocampus plus the entorhinal, perirhinal and parahippocampal cortices, and it is reciprocally connected with widespread neocortex.',
      'Imaging in the lecture showed it is involved in both encoding and retrieval, with different subregions supporting recollection and familiarity.',
      'The diencephalon (thalamus and mammillary bodies) is the other region whose damage causes amnesia; this is the region removed in H.M.',
      'The inner part of the lobe beneath the lateral fissure, containing the hippocampus and surrounding cortex: the brain\'s system for declarative memory.'],
    learn:'The medial (inner) portion of the temporal lobe, comprising the hippocampus and the adjacent entorhinal, perirhinal and parahippocampal cortices (with the amygdala nearby). Together these form the medial temporal lobe memory system for declarative memory, involved in both encoding and retrieval; the hippocampus supports recollection while the perirhinal cortex supports familiarity. Bilateral damage causes amnesia, as in H.M.' },

  { id:'entorhinal', answer:'Entorhinal cortex', aliases:['entorhinal','EC','MEC','medial entorhinal cortex','entorhinal area','Brodmann area 28','BA 28'], cat:'anatomy', unit:'L5', source:'Lecture 5 (place and grid cells)', lab:'Cortex_Explorer.html',
    clues:[
      'Braak and Braak (1991) found that the neurofibrillary tangles of Alzheimer\'s disease appear in and around it first, before spreading to the hippocampus and neocortex.',
      'It is the main gateway between the hippocampus and neocortex: its perforant path delivers most cortical input to the hippocampus, and hippocampal output returns through it.',
      'Grid cells, which fire at the vertices of a repeating triangular lattice as an animal moves, were discovered in it by the Moser lab, along with border cells.',
      'The hippocampus contains place cells; this neighboring cortex contains grid cells and border cells.',
      'The cortex of the medial temporal lobe that relays information between the neocortex and the hippocampus, and where grid cells are found.'],
    learn:'Cortex of the anterior parahippocampal gyrus (Brodmann area 28) that serves as the main interface between the hippocampus and the neocortex: most cortical input reaches the hippocampus through it (the perforant path), and hippocampal output returns through it. Its medial part contains grid cells and border cells (Moser lab). It is among the first regions affected by Alzheimer\'s disease.' },

  { id:'perirhinal', answer:'Perirhinal cortex', aliases:['perirhinal','PRC','perirhinal area','rhinal cortex'], cat:'anatomy', unit:'L5', source:'Lecture 5 study guide',
    clues:[
      'Bowles and colleagues (2007) studied a patient whose surgery removed this region but spared the hippocampus: recollection was intact while the sense of familiarity was impaired.',
      'It lies at the front of the parahippocampal gyrus, in Brodmann areas 35 and 36, and is important for recognizing objects.',
      'In the lecture\'s fMRI studies its activity tracked recognition confidence (familiarity), while hippocampal activity tracked recollection.',
      'The hippocampus beside it supports recollection with details; this cortex supports a bare sense that an item is old.',
      'The medial temporal lobe cortex surrounding the hippocampus that is associated with familiarity-based recognition memory.'],
    learn:'Cortex of the anterior parahippocampal gyrus along the rhinal sulcus (Brodmann areas 35 and 36). It processes complex object information and supports familiarity-based recognition: in the lecture\'s fMRI studies its activity tracked recognition confidence, while the hippocampus was engaged specifically for recollection. Damage that includes it but spares the hippocampus can impair familiarity while sparing recollection.' },

  { id:'parahippocampal', answer:'Parahippocampal cortex', aliases:['parahippocampal','PHC','parahippocampal gyrus','posterior parahippocampal cortex','parahippocampal area'], cat:'anatomy', unit:'L5', source:'Lecture 5 (encoding and the hippocampus)', lab:'Cortex_Explorer.html',
    clues:[
      'Epstein and Kanwisher (1998) found a patch of it that responds strongly to scenes and places but hardly to faces or objects, and named the patch after it.',
      'It occupies the back part of the gyrus running beneath the hippocampus, and it carries spatial and contextual information toward the hippocampus by way of the entorhinal cortex.',
      'In the lecture\'s subsequent-memory study, activity in its posterior part during encoding, along with hippocampal activity, predicted later recollection of a word\'s color.',
      'The perirhinal cortex in front of it is tied to object familiarity; this region behind it is tied to scenes and spatial context.',
      'The medial temporal lobe cortex beside and behind the hippocampus that processes scenes and spatial context and feeds them into the hippocampus.'],
    learn:'Cortex of the posterior parahippocampal gyrus, on the ventral surface of the medial temporal lobe. It processes spatial layout and context (it contains the scene-selective "parahippocampal place area") and projects to the hippocampus via the entorhinal cortex. In the lecture\'s subsequent-memory study (Ranganath et al.), posterior parahippocampal activity at encoding, together with hippocampal activity, predicted later recollection (correct source judgments). A mark from one of H.M.\'s surgical clips was found on his right parahippocampal gyrus.' },

  { id:'hm', answer:'Patient H.M.', aliases:['HM','H.M.','patient HM','Henry Molaison','Molaison','Henry Gustav Molaison','Henry M'], cat:'history', unit:'L5', source:'Lecture 5 study guide',
    clues:[
      'After his death in 2008, his brain was frozen and cut into about 2,400 thin sections in a 53-hour session that was streamed live online.',
      'Brenda Milner found that over three days he got steadily better at tracing a star seen only in a mirror, while insisting each time that he had never done it before.',
      'He had above-average intelligence (IQ 112) and enjoyed crossword puzzles, yet surgery at age 27 left him with profound, permanent anterograde amnesia.',
      'Clive Wearing\'s amnesia came from a viral infection; this patient\'s came from an operation to treat epilepsy.',
      'The most famous patient in memory research, whose bilateral medial temporal lobe removal in 1953 left him unable to form new long-term memories (Scoville and Milner, 1957).'],
    learn:'Henry Molaison (1926–2008), known in the literature as H.M. To treat intractable epilepsy, surgeon William Scoville removed the front half of his hippocampus, most of his amygdala and the surrounding medial temporal cortex on both sides in 1953. He was left with profound anterograde amnesia; his knowledge of facts from before the surgery survived, but he could recall few detailed personal episodes. His intelligence and short-term memory were intact, and he could still learn new skills (e.g. mirror tracing) and show priming. Studied for decades by Brenda Milner and Suzanne Corkin, his case established that the medial temporal lobe is essential for forming new declarative memories and that memory is separable from other cognitive abilities.' },

  { id:'milner', answer:'Brenda Milner', aliases:['Milner','Dr. Milner','Professor Milner'], cat:'history', unit:'L5', source:'Lecture 5 (anatomy of memory)',
    clues:[
      'Born in Manchester in 1918, she did her PhD at McGill under Donald Hebb and spent her career at Penfield\'s Montreal Neurological Institute.',
      'Her studies of epilepsy patients after one-sided temporal-lobe surgery showed that left removals impaired verbal memory while right removals impaired memory for faces, designs and mazes.',
      'She coauthored the classic 1957 paper with surgeon William Scoville analyzing a young man\'s memory loss after bilateral medial temporal lobe removal.',
      'Suzanne Corkin studied H.M.\'s life and memory in later decades; this neuropsychologist tested him first, and showed in 1962 that he could learn mirror tracing.',
      'The neuropsychologist whose testing of patient H.M. established the role of the medial temporal lobe in memory.'],
    learn:'British-Canadian neuropsychologist (born 1918) at the Montreal Neurological Institute and a founder of neuropsychology. With William Scoville she described H.M.\'s amnesia (1957), showed that he could still learn a motor skill (mirror tracing) without remembering the practice (1962), and showed that left and right temporal-lobe lesions produce verbal and nonverbal memory deficits, respectively.' },

  { id:'clive_wearing', answer:'Clive Wearing', aliases:['Wearing','Clive','patient Clive Wearing'], cat:'history', unit:'L5', source:'Lecture 5 (amnesia)',
    clues:[
      'His wife Deborah wrote about their life together in the 2005 memoir Forever Today, and a documentary called him "the man with the seven-second memory."',
      'Before his illness he was a conductor who worked for BBC Radio 3 and an authority on the Renaissance composer Orlande de Lassus.',
      'His diary is filled with entries like "Now I am really, completely awake," each crossed out as he forgets writing the last; his memory lasts roughly 7 to 30 seconds.',
      'H.M.\'s amnesia was caused by surgery; this musician\'s was caused by herpes simplex encephalitis in 1985.',
      'The British musician with profound anterograde and retrograde amnesia after a viral brain infection, who can still play the piano and conduct a choir.'],
    learn:'British musician (born 1938) who in 1985 developed herpes simplex encephalitis, which destroyed much of his hippocampi and surrounding tissue. He has profound anterograde amnesia (new information lasts seconds) and extensive retrograde amnesia, yet intact short-term memory and preserved procedural memory: he can still sight-read, play the piano and conduct. He greets his wife joyfully each time as if after a long absence. A vivid example of the dissociation between declarative and procedural memory.' },

  { id:'standard_consolidation', answer:'Standard consolidation theory', aliases:['standard consolidation model','standard model of consolidation','standard consolidation','standard model','standard theory','consolidation theory','consolidation model','standard consolidation hypothesis'], cat:'memory', unit:'L5', source:'Lecture 5 study guide',
    clues:[
      'Kim and Fanselow (1992) supported it in rats: hippocampal lesions made one day after fear conditioning erased the memory of the context, but lesions made 28 days after left it intact.',
      'Alvarez and Squire (1994) modeled it as the hippocampus temporarily binding the scattered cortical pieces of a memory until direct cortical connections are strong enough to hold it alone.',
      'It predicts temporally graded amnesia: patients with hippocampal damage should keep their remote memories, even detailed episodic ones, but lose recent ones.',
      'The transformation hypothesis says detailed episodic memories always depend on the hippocampus; this view says every memory eventually becomes independent of it.',
      'The view (Squire et al., 1984) that the hippocampus is needed for a memory only temporarily, until over years the memory comes to reside entirely in the neocortex.'],
    learn:'The view (Squire and colleagues) that the hippocampus binds together the neocortical components of a new memory during learning, and that over time (years, in humans) connections among the cortical components strengthen until the memory no longer depends on the hippocampus. It predicts temporally graded retrograde amnesia with preserved, fully detailed remote memories after hippocampal damage. It is challenged by findings that patients like H.M. lack detailed remote episodic memories and by very long or absent gradients (Nadel and Moscovitch, 1997).' },

  { id:'transformation_hypothesis', answer:'Transformation hypothesis', aliases:['transformation theory','transformation model','transformation account','trace transformation theory','trace transformation','transformation'], cat:'memory', unit:'L5', source:'Lecture 5 study guide',
    clues:[
      'It grew out of Nadel and Moscovitch\'s 1997 multiple trace theory, which argued that a consolidation process as long as a human life span made little adaptive sense.',
      'On this view the neocortex gradually builds a schematic, gist-like version of a memory, while the detailed, context-rich original stays in the hippocampus for as long as it exists.',
      'Proposed by Winocur and colleagues (2010), it predicts that hippocampal patients can retrieve the gist of remote events but not their contextual details, which is what patients like H.M. show.',
      'The standard consolidation theory says memories leave the hippocampus and become independent of it; this view says episodic memories never do, they only give rise to semantic-like copies.',
      'The alternative to standard consolidation in which episodic memories always depend on the hippocampus, while over time the neocortex develops a less detailed, semantic-like version of them.'],
    learn:'An alternative to the standard consolidation theory (Winocur, Moscovitch and Bontempi, 2010). Memories are not transferred from the hippocampus to the neocortex. Instead, the initial episodic, context-bound memory always depends on the hippocampus, and over time it supports the development in neocortex of a schematic version that keeps the gist but few contextual details: episodic memories give rise to semantic-like memories. It explains why patients like H.M. recall facts and gist from their past but not specific, detailed episodes.' },

  { id:'sequence_learning', answer:'Implicit sequence learning', aliases:['sequence learning','serial reaction time task','serial reaction time','SRT task','SRTT','SRT','implicit sequence','sequence task'], cat:'memory', unit:'L5', source:'Lecture 5 (procedural learning in amnesia)',
    clues:[
      'Nissen and Bullemer introduced its standard task in 1987, and found that adding a distracting tone-counting task largely wiped out the learning.',
      'Participants press one of four keys to match where an asterisk appears; unknown to them, the positions follow a repeating order, and reaction times drop until a random block slows them back down.',
      'In the lecture\'s data, Korsakoff\'s amnesics sped up on the repeating 10-item pattern as much as controls did, yet did not remember having done the task at all.',
      'Stem completion shows preserved priming in amnesia; this shows preserved procedural learning, measured by reaction time.',
      'Procedural learning in which reaction times get faster for a repeating pattern of target locations, even when people do not notice the repeat.'],
    learn:'Learning a repeating sequence without awareness, measured with the serial reaction time task (Nissen and Bullemer, 1987): participants respond to a target appearing at one of four locations; when the locations follow a hidden repeating sequence, responses speed up, and they slow again when a random block is introduced. Amnesic patients (e.g. Korsakoff\'s; Nissen et al., 1989) show normal learning and retain it, despite not remembering the task, showing that procedural learning does not depend on the brain systems damaged in amnesia.' },

  { id:'stem_completion', answer:'Stem completion', aliases:['word stem completion','stem completion task','word stem completion task','stem completion test','word completion'], cat:'memory', unit:'L5', source:'Lecture 5 (memory without awareness)',
    clues:[
      'Graf, Squire and Mandler (1984) showed that instructions are everything: amnesic patients did normally when asked for the first word that came to mind, but poorly when told to use the cue to recall studied words.',
      'Its cues are the first few letters of a word, such as MOT___, which could be finished many ways; the measure is how often people finish them with recently studied words.',
      'In the lecture\'s three-test comparison, amnesic patients were impaired at free recall and category-cued recall but showed no deficit on this test of perceptual priming.',
      'Free recall asks people to report the studied words they consciously remember; this test asks them to finish the first letters of words with whatever comes to mind.',
      'The priming test in which people see the first few letters of a word and fill in the first word that comes to mind; amnesic patients do it normally.'],
    learn:'An implicit memory test: participants see word beginnings (e.g. MOT___) and fill in the first word that comes to mind. Priming is shown when they produce recently studied words more often than unstudied ones. Amnesic patients show normal priming on this test despite impaired free recall and cued recall (Warrington and Weiskrantz, 1970; Graf, Squire and Mandler, 1984), evidence that perceptual priming does not depend on the medial temporal lobe.' },

  { id:'recollection', answer:'Recollection', aliases:['recollect','recollecting','recollective memory','recollection memory'], cat:'memory', unit:'L5', source:'Lecture 5 study guide',
    clues:[
      'In Yonelinas\'s dual-process signal-detection model it is a threshold process that either succeeds or fails, which is why it makes recognition ROC curves asymmetric.',
      'In recognition memory, it feels like mentally traveling back to the moment of the encounter, and it comes bundled with details: who, where, when, what else was happening.',
      'In the lecture\'s fMRI studies the hippocampus was active only for items retrieved this way, and hippocampal and posterior parahippocampal activity at encoding predicted later correct source (color) judgments.',
      'Familiarity is the bare feeling that something is old, marked by "I know..."; this is the detailed re-experiencing marked by "I remember..."',
      'The form of recognition memory in which you retrieve specific contextual details of the original episode, supported by the hippocampus.'],
    learn:'One of the two processes in dual-process theories of recognition memory: retrieving qualitative details of the study episode (where, when, with whom, what else happened), experienced as mentally traveling back ("I remember..."). In the lecture\'s fMRI studies it engaged the hippocampus at retrieval, and hippocampal and posterior parahippocampal activity at encoding predicted it later. Contrast with familiarity, supported by perirhinal cortex.' },

  { id:'familiarity', answer:'Familiarity', aliases:['familiarity-based recognition','sense of familiarity','familiar','knowing','know response'], cat:'memory', unit:'L5', source:'Lecture 5 study guide',
    clues:[
      'Mandler\'s 1980 example was the "butcher on the bus": you are sure you know the man, but cannot say from where until you picture him behind the meat counter.',
      'It varies continuously in strength, which is why it is measured with confidence ratings, and it is faster than its partner process.',
      'In the lecture\'s fMRI studies, perirhinal activity at encoding and anterior parahippocampal activity at retrieval scaled with recognition confidence, while the hippocampus did not.',
      'Recollection brings back the details of the episode ("I remember..."); this is the bare feeling that something is old ("I know...").',
      'The form of recognition memory in which an item simply feels old, a sense of pastness without any retrieved detail, associated with perirhinal cortex.'],
    learn:'The second process in dual-process theories of recognition: a sense that an item has been encountered before, without retrieval of contextual details ("I know..."). It varies in strength and is indexed by recognition confidence. It is supported by perirhinal cortex rather than the hippocampus, as shown in the lecture\'s fMRI studies of encoding (Ranganath et al.) and retrieval (Montaldi et al., 2006). Contrast with recollection.' },

  { id:'subsequent_memory', answer:'Subsequent memory paradigm', aliases:['subsequent memory effect','subsequent memory','subsequent memory analysis','subsequent memory design','subsequent memory task','subsequent memory procedure'], cat:'memory', unit:'L5', source:'Lecture 5 (encoding and the hippocampus)',
    clues:[
      'Its ERP version goes back to Sanquist and colleagues (1980), and in 1998 two fMRI papers in the same issue of Science (Wagner et al.; Brewer et al.) used it to locate the brain regions that predict remembering.',
      'It studies encoding using information from retrieval: brain activity is recorded during study, and the trials are sorted afterward by whether each item was later remembered.',
      'In the lecture\'s version (Ranganath et al.), participants judged words for size or animacy depending on ink color, and were later tested on recognition confidence and on which color each word had been.',
      'A standard recognition test measures memory at retrieval; this method looks back at encoding activity to find what predicts successful memory.',
      'The fMRI method of scanning people while they study items, testing their memory afterward, and comparing encoding activity for items later remembered versus forgotten.'],
    learn:'A method for studying encoding: record brain activity (fMRI or EEG) while participants study items, test their memory afterward, then sort the encoding trials by later memory outcome (remembered vs. forgotten, or recollected vs. merely familiar). Regions more active for later-remembered items show a "subsequent memory effect." In the lecture\'s study (Ranganath et al.), hippocampal and posterior parahippocampal encoding activity predicted later recollection, and perirhinal activity predicted familiarity.' },

  { id:'place_cell', answer:'Place cell', aliases:['place cells','hippocampal place cell','hippocampal place cells','place neuron','place neurons'], cat:'memory', unit:'L5', source:'Lecture 5 study guide',
    clues:[
      'O\'Keefe and Dostrovsky discovered them in 1971, and O\'Keefe and Nadel\'s 1978 book argued from them that the hippocampus is a "cognitive map," a phrase borrowed from Tolman.',
      'When an animal is moved to a new environment, the whole population "remaps," each neuron firing in a new, unrelated location or falling silent.',
      'They are identified with single-unit recording: a rat explores an arena while each neuron\'s spikes are plotted against its position, giving a heat map with a single hot spot.',
      'Grid cells in entorhinal cortex fire at many locations arranged in a lattice; these hippocampal neurons fire at just one location.',
      'A hippocampal neuron that fires whenever an animal is in one particular location in its environment.'],
    learn:'A neuron in the hippocampus that fires when an animal occupies a particular location (its place field) and is quiet elsewhere. Discovered by John O\'Keefe (1971; Nobel Prize 2014). Identified with single-unit recording by plotting each cell\'s firing rate against the animal\'s position as it explores. Populations of place cells form a map of the environment and remap in new environments. Contrast with grid cells and border cells in entorhinal cortex.' },

  { id:'grid_cell', answer:'Grid cell', aliases:['grid cells','entorhinal grid cell','entorhinal grid cells','grid neuron','grid neurons'], cat:'memory', unit:'L5', source:'Lecture 5 study guide',
    clues:[
      'Their spacing increases in steps from the dorsal to the ventral end of medial entorhinal cortex, so different modules tile space at different scales, like rulers of different sizes.',
      'Human fMRI shows a six-fold (hexadirectional) signal consistent with them, even when people "navigate" an abstract space of stretchy bird shapes (Constantinescu et al., 2016).',
      'Each one fires at many locations arranged at the vertices of equilateral triangles, tiling the whole arena; they were discovered by the Moser lab (Nobel Prize 2014).',
      'Place cells in the hippocampus fire at a single location; these entorhinal neurons fire at many locations in a regular repeating pattern.',
      'A neuron in entorhinal cortex whose firing locations form a regular hexagonal lattice across the environment.'],
    learn:'A neuron in medial entorhinal cortex that fires at multiple locations forming a regular triangular (hexagonal) lattice that tiles the environment. Discovered by the Moser lab (Fyhn et al., 2004; Hafting et al., 2005; Nobel Prize 2014). Grid cells with different spacings may combine to specify positions, providing a metric for the hippocampal place map, and grid-like codes have been found in humans even for abstract conceptual spaces. Identified with single-unit recording during free exploration.' },

  { id:'border_cell', answer:'Border cell', aliases:['border cells','boundary cell','boundary cells','border neuron','border neurons'], cat:'memory', unit:'L5', source:'Lecture 5 (place, grid and border cells)',
    clues:[
      'Their existence was predicted by a model from O\'Keefe and Burgess\'s group (Hartley et al., 2000) in which place fields are built from inputs tuned to the distance and direction of walls.',
      'Solstad and colleagues in the Moser lab reported them in medial entorhinal cortex in 2008; each fires along one or more walls of the enclosure.',
      'In the lecture\'s demonstration, one kept firing at the wall when the wall was moved, when the enclosure was stretched, and along a newly inserted wall.',
      'Grid cells fire in a lattice across the whole floor; these entorhinal neurons fire only along the edges of the environment.',
      'An entorhinal neuron that fires when an animal is next to a wall or edge of its environment.'],
    learn:'A neuron, found in medial entorhinal cortex (Solstad et al., 2008), that fires when the animal is close to a boundary of the environment, such as a wall or drop-off. Its firing follows the boundary when it is moved, stretched or added, so these cells anchor the spatial map to the layout of the environment. They work alongside grid cells and hippocampal place cells.' },

  { id:'single_unit', answer:'Single-unit recording', aliases:['single-unit recordings','single unit','single-neuron recording','single-cell recording','unit recording','extracellular recording','single-unit electrophysiology','microelectrode recording'], cat:'methods', unit:'L5', source:'Lecture 5 study guide',
    clues:[
      'Hubel\'s 1957 electrolytically sharpened tungsten microelectrode made it practical to hold on to one neuron for hours in an awake animal.',
      'An electrode tip placed just outside a neuron picks up its action potentials as brief spikes, and spike sorting separates nearby cells by the shapes of their waveforms.',
      'Place cells and grid cells are identified this way: each neuron\'s firing is recorded while a rat explores an arena and is plotted against the rat\'s position.',
      'The local field potential sums the activity of many neurons around an electrode; this method isolates the spikes of individual neurons.',
      'The invasive method of recording the action potentials of individual neurons with a microelectrode, used to identify place cells and grid cells.'],
    learn:'Recording the action potentials (spikes) of individual neurons with a fine microelectrode placed in or next to the cell, usually extracellularly. It has the best spatial and temporal resolution of any method but is invasive, so it is used mainly in animals (and occasionally in patients with implanted electrodes). Place cells, grid cells and border cells were discovered by recording single units while rats explored, then plotting firing rate as a function of location.' },

  { id:'hebbian', answer:'Hebbian learning', aliases:['Hebbian','Hebbian plasticity','Hebbian rule','Hebbian theory','Hebb rule','Hebbs rule','Hebbs law','Hebb\'s postulate','Hebbian synapse','Hebb learning'], cat:'neuron', unit:'L5', source:'Lecture 5 (circuit mechanisms of learning)',
    clues:[
      'Its catchiest slogan is usually credited not to its originator but to neuroscientist Carla Shatz, who popularized it in a 1992 Scientific American article on the developing visual system.',
      'Long-term potentiation, discovered by Bliss and Lømo in 1973 in the rabbit hippocampus, is its best-known physiological example: coincident pre- and postsynaptic activity strengthens a synapse for hours or longer.',
      'The lecture listed ways it could be implemented: changes in receptor density, creation of new synapses, elimination of synapses, and changes in neurotransmitter release.',
      'Long-term potentiation is a measured change at real synapses; this is the 1949 principle from The Organization of Behavior that anticipated it.',
      'The principle that a synapse strengthens when the neurons on both sides of it are active together: "neurons that fire together, wire together."'],
    learn:'The learning rule proposed by Donald Hebb in The Organization of Behavior (1949): when neuron A repeatedly takes part in firing neuron B, the strength of A\'s action on B increases. In short, connections between neurons that are active together are strengthened ("neurons that fire together, wire together"). Long-term potentiation is a physiological mechanism of this kind. In circuits it could be implemented through changes in receptor density, new synapses, synapse elimination or changes in transmitter release.' },

  { id:'bartlett', answer:'Frederic Bartlett', aliases:['Bartlett','Frederick Bartlett','Sir Frederic Bartlett','Sir Frederick Bartlett','Frederic C. Bartlett','Frederick C. Bartlett','F. C. Bartlett','Frederic Charles Bartlett'], cat:'history', unit:'L5', source:'Lecture 5 (what is memory?)',
    clues:[
      'He was knighted in 1948, and his best-known stimulus was a Native American folk tale, "The War of the Ghosts," which his English participants retold again and again.',
      'His method of "serial reproduction" passed a story from one person to the next, like the game of telephone, revealing how it shrank and was reshaped to fit the reteller\'s expectations, or schemas.',
      'The first professor of experimental psychology at Cambridge (1931), he wrote in Remembering (1932) that recall is "an imaginative reconstruction, or construction," hardly ever really exact.',
      'Plato pictured memories as fixed impressions in wax; this British psychologist replaced that picture with remembering as active reconstruction.',
      'The psychologist who showed that people\'s recall of stories changes over repeated retellings, and concluded that remembering is reconstructive rather than a replay of fixed traces.'],
    learn:'British psychologist (1886–1969), the first professor of experimental psychology at Cambridge. In Remembering (1932) he showed, using stories such as "The War of the Ghosts," that recall changes with each retelling, losing details and conforming to the person\'s schemas. He concluded that remembering is an active reconstruction rather than the re-excitation of fixed traces, overturning the classical "wax tablet" view.' },

  /* ---------------------------- LECTURE 6 ---------------------------- */
  { id:'aphasia', answer:'Aphasia', aliases:['aphasias','dysphasia','aphasic','acquired language disorder'], cat:'lesion', unit:'L6', source:'Lecture 6 study guide',
    clues:[
      'Armand Trousseau gave it its modern name in 1864, objecting that Broca\'s preferred term, "aphémie," meant "infamy" in Greek.',
      'It can appear in any channel that carries language: speaking and understanding speech, reading and writing, even signing and braille.',
      'About 40% of all strokes produce some form of it, which is why stroke patients have been the main window onto language in the brain.',
      'Dysarthria and hypophonia are disturbances of speech, the motor act; this is a disturbance of language itself.',
      'A disorder of language caused by brain damage or disease, independent of general cognitive abilities such as memory, attention and perception.'],
    learn:'An acquired disorder of language caused by brain damage (most often stroke) or disease, affecting the production and/or comprehension of language in any modality (speech, writing, sign) while general cognition can be intact. About 40% of strokes produce some language deficit. It typically involves breakdowns of grammar and syntax and is often accompanied by anomia and paraphasias. Called dysphasia in some parts of the world. Contrast with speech disorders such as dysarthria and hypophonia.' },

  { id:'brocas_aphasia', answer:'Broca\'s aphasia', aliases:['Broca aphasia','expressive aphasia','nonfluent aphasia','non-fluent aphasia','motor aphasia','Broca\'s type aphasia'], cat:'lesion', unit:'L6', source:'Lecture 6 study guide',
    clues:[
      'Mohr and colleagues (1978) found that a lasting case of it requires a large lesion including the underlying white matter and insula; damage confined to the classic frontal area produces only a milder, transient disorder.',
      'Patients often understand simple sentences but are at chance on reversible passives like "The horse was kicked by the cow," and many can still sing familiar songs they cannot speak.',
      'Its speech is nonfluent, labored and hesitant, missing function words, while comprehension is relatively intact; most patients also have weakness on the right side of the body.',
      'Wernicke\'s aphasia is fluent but empty, with poor comprehension; this one is effortful and halting, with comprehension relatively spared.',
      'The halting, effortful aphasia caused by damage to the left inferior frontal lobe, first described in the patient "Tan."'],
    learn:'A nonfluent, expressive aphasia after damage to the left inferior frontal region (Broca\'s area, Brodmann areas 44 and 45) and, for lasting deficits, surrounding cortex and white matter. Speech is slow, effortful and telegraphic (function words omitted), often with anomia and articulation problems; comprehension is relatively intact for simple sentences but impaired for syntactically complex ones such as reversible passives. Automatic speech and singing may be spared, and right hemiplegia is common. Patients are typically aware of their deficit.' },

  { id:'wernickes_aphasia', answer:'Wernicke\'s aphasia', aliases:['Wernicke aphasia','receptive aphasia','sensory aphasia','jargon aphasia','Wernicke\'s type aphasia'], cat:'lesion', unit:'L6', source:'Lecture 6 study guide',
    clues:[
      'Because its patients often seem unaware that their speech makes no sense, they have sometimes been mistaken for psychotic or confused rather than recognized as having a language disorder.',
      'Speech keeps a normal rate, melody and grammar but is full of paraphasias and made-up words, sometimes reaching "word salad."',
      'It follows damage to the posterior left superior temporal gyrus extending into adjacent parietal cortex: patients cannot understand what they hear or read and cannot repeat, but usually have no paralysis.',
      'Broca\'s aphasia is halting with relatively good comprehension; this one is fluent and empty, with poor comprehension.',
      'The fluent aphasia with impaired comprehension caused by damage to the posterior left temporal lobe, with errors like "girl" for "curl" and "bread" for "cake."'],
    learn:'A fluent aphasia after damage to the posterior left superior temporal gyrus (Wernicke\'s area) and underlying white matter, often extending into parietal cortex. Speech is fluent, with normal grammar and prosody, but filled with paraphasias and neologisms and short on meaning; comprehension of spoken and written language and repetition are impaired. Patients are often unaware of their errors, and there is usually no paralysis.' },

  { id:'brocas_area', answer:'Broca\'s area', aliases:['Broca area','Broca\'s region','Broca region','left inferior frontal gyrus','LIFG','inferior frontal gyrus','IFG'], cat:'anatomy', unit:'L6', source:'Lecture 6 study guide', lab:'Cortex_Explorer.html',
    clues:[
      'Its rear part, the pars opercularis, is named for the "little lid" (operculum) of cortex it forms over the insula; its front part is the pars triangularis.',
      'MRI of the two preserved brains that originally defined it (Dronkers et al., 2007) showed lesions extending deep into medial regions and the superior longitudinal fasciculus, well beyond the region now given its name.',
      'It sits in the left inferior frontal lobe, Brodmann areas 44 and 45, just in front of the motor cortex that controls the face and mouth.',
      'Wernicke\'s area in the posterior temporal lobe was linked to comprehension; this frontal region was linked to speech production.',
      'The region of the left frontal lobe, damaged in patient "Tan," classically associated with speech production.'],
    learn:'A region of the left inferior frontal gyrus (pars opercularis and pars triangularis; Brodmann areas 44 and 45) named after Paul Broca, who in 1861 linked damage here to loss of fluent speech in patient Leborgne ("Tan"). Classically the center for speech production, later linked to syntax. Modern work shows it contains distinct subregions, some language-selective and some serving domain-general working memory and cognitive control, and lasting Broca\'s aphasia requires damage beyond it.' },

  { id:'wernickes_area', answer:'Wernicke\'s area', aliases:['Wernicke area','Wernicke\'s region','posterior superior temporal gyrus','left posterior superior temporal gyrus','pSTG','posterior STG'], cat:'anatomy', unit:'L6', source:'Lecture 6 study guide', lab:'Cortex_Explorer.html',
    clues:[
      'When Tremblay and Dick (2016) surveyed 159 language researchers, they found wide disagreement about where it even is; definitions in the literature range from the superior temporal gyrus to the supramarginal and angular gyri.',
      'Its classic definition comes from an 1874 monograph by a 26-year-old German neurologist, who argued that it stores the "sound images" of words.',
      'It lies in the back part of the left superior temporal gyrus (around area 22), next to auditory cortex, and connects to the frontal lobe through the arcuate fasciculus.',
      'Broca\'s area in the inferior frontal lobe was linked to speech production; this temporal region was linked to comprehension.',
      'The region of the left temporal lobe classically associated with understanding speech, whose damage causes fluent aphasia with poor comprehension.'],
    learn:'A region of the posterior left superior temporal gyrus (around Brodmann area 22), next to auditory cortex, named after Carl Wernicke (1874). Classically considered the store of word sound forms and the center for speech comprehension, connected to Broca\'s area by the arcuate fasciculus. Damage to it and the underlying white matter is associated with Wernicke\'s aphasia. Its exact boundaries are debated.' },

  { id:'anomia', answer:'Anomia', aliases:['anomic aphasia','anomic','dysnomia','word-finding difficulty','word-finding deficit','naming deficit','word retrieval deficit'], cat:'lesion', unit:'L6', source:'Lecture 6 study guide',
    clues:[
      'Damasio and colleagues (1996) found that failures to name people, animals and tools mapped onto different parts of the left temporal lobe, from the temporal pole backward.',
      'Everyone has a brief, harmless version of it in the tip-of-the-tongue state (Brown and McNeill, 1966), knowing a word\'s first letter or number of syllables but unable to produce it.',
      'Patients\' speech fills with vague stand-ins like "thing" ("That thing is for writing" for a pencil), and in the lecture most of Broca\'s patients had it too.',
      'A paraphasia is producing the wrong word or sound; this is failing to come up with the word at all.',
      'Difficulty finding words, especially the names of objects, in speech and writing.'],
    learn:'Difficulty retrieving words, especially nouns (the names of objects and people), in speaking and writing, while comprehension can be intact. It occurs in nearly all aphasias and is the main symptom of anomic aphasia. Patients talk around the missing word or use vague words ("thing"). The tip-of-the-tongue state is a normal, transient version.' },

  { id:'paraphasia', answer:'Paraphasia', aliases:['paraphasias','paraphasic error','paraphasic errors','paraphasic'], cat:'lesion', unit:'L6', source:'Lecture 6 study guide',
    clues:[
      'Researchers also count "formal" errors, a real word similar only in sound, and "mixed" errors similar in both sound and meaning, such as "rat" for "cat."',
      'They are classified by how the error relates to the target: a word related in meaning, a near miss in sound, or a word that does not exist.',
      'They are a hallmark of Wernicke\'s aphasia ("girl" for "curl," "bread" for "cake"), and the lecture listed three types: neologistic, semantic and phonemic.',
      'Anomia is failing to come up with a word; this is producing the wrong word or sound in place of the intended one.',
      'An error in speech production in which an unintended word, sound or nonword is substituted for the intended word.'],
    learn:'The production of unintended syllables, words or nonwords during speech, a common feature of aphasia (especially Wernicke\'s and conduction aphasia). Types: semantic (a word related in meaning, "knife" for "spoon"), phonemic (a sound substitution, "scoon" for "spoon") and neologistic (a nonword, "glypt").' },

  { id:'semantic_paraphasia', answer:'Semantic paraphasia', aliases:['semantic paraphasias','semantic substitution','semantic error','semantic errors'], cat:'lesion', unit:'L6', source:'Lecture 6 (paraphasias)',
    clues:[
      'In Dell and colleagues\' 1997 two-step model of naming, these errors arise at the first step, selecting a word from its meaning (the lemma), before any sounds are chosen.',
      'Healthy speakers make them as slips of the tongue; in aphasia, lesion mapping ties them to damage in the left anterior temporal lobe (Schwartz et al., 2009).',
      'The lecture\'s example: saying "knife" when you mean "spoon."',
      'A phonemic paraphasia gets the sounds wrong ("scoon"); this gets the word wrong, swapping in one related in meaning.',
      'A speech error in which a word related in meaning is substituted for the intended word.'],
    learn:'A paraphasia in which a real word related in meaning to the target replaces it (e.g. "knife" for "spoon", "table" for "chair"). A type of verbal (real-word) paraphasia, common in Wernicke\'s aphasia and after left temporal lesions. Contrast with phonemic paraphasias (sound errors) and neologistic paraphasias (nonwords).' },

  { id:'phonemic_paraphasia', answer:'Phonemic paraphasia', aliases:['phonemic paraphasias','phonological paraphasia','phonological paraphasias','literal paraphasia','literal paraphasias','phonemic error','phonemic errors'], cat:'lesion', unit:'L6', source:'Lecture 6 (paraphasias)',
    clues:[
      'Patients with conduction aphasia, who make many of them, often show "conduite d\'approche": repeated, increasingly close attempts to hit the target word.',
      'The output usually keeps the target\'s rhythm and most of its sounds; the error is an added, dropped, swapped or substituted speech sound.',
      'The lecture\'s example: saying "scoon" for "spoon."',
      'A semantic paraphasia swaps in a word related in meaning; this swaps sounds, leaving something that sounds like the target.',
      'A speech error in which sounds within a word are substituted, added or rearranged, so the word comes out sounding similar to the intended one.'],
    learn:'A paraphasia in which speech sounds (phonemes) in a word are substituted, added, omitted or transposed, so the result resembles the target in sound (e.g. "scoon" for "spoon"). Also called literal paraphasia. Common in conduction and Wernicke\'s aphasia. Contrast with semantic paraphasias (meaning-related word swaps) and neologistic paraphasias (nonwords).' },

  { id:'neologism', answer:'Neologistic paraphasia', aliases:['neologism','neologisms','neologistic','neologistic paraphasias','nonword paraphasia','neologistic jargon'], cat:'lesion', unit:'L6', source:'Lecture 6 (paraphasias)',
    clues:[
      'When they dominate a patient\'s fluent, well-intoned speech, clinicians call the result "jargon," which can sound like a foreign language with normal sentence melody.',
      'They are built from legal sound combinations of the patient\'s language, sometimes from the target\'s sounds mangled beyond recognition and sometimes with no identifiable target at all.',
      'The lecture\'s examples were "glypt" and "crint."',
      'Semantic and phonemic paraphasias leave a real or recognizable word; this produces something that is not a word at all.',
      'A paraphasia in which the patient produces a made-up nonword in place of the intended word.'],
    learn:'A paraphasia in which the patient produces a nonword (e.g. "glypt", "crint") that bears little or no resemblance to the target. Typical of severe Wernicke\'s aphasia, where they can dominate fluent speech ("neologistic jargon"). Contrast with semantic and phonemic paraphasias.' },

  { id:'dysarthria', answer:'Dysarthria', aliases:['dysarthric','dysarthrias'], cat:'lesion', unit:'L6', source:'Lecture 6 study guide',
    clues:[
      'Darley, Aronson and Brown\'s Mayo Clinic system (1969) sorted it into types by what was damaged: flaccid, spastic, ataxic, hypokinetic, hyperkinetic and mixed.',
      'Its name is Greek for "bad articulation," and it can arise from damage anywhere in the motor system for speech: cortex, basal ganglia, cerebellum, brainstem, cranial nerves or the muscles themselves.',
      'The lecture classed it, with hypophonia, as a disturbance of speech, not language: patients cannot control their tongue or voice box well and may slur words.',
      'Aphasia is a breakdown of language itself; this is a breakdown in the muscular execution of speech, with word choice and grammar intact.',
      'A motor speech disorder of poor articulation, in which the muscles used for speech are weak, paralyzed or uncoordinated.'],
    learn:'A motor speech disorder in which weakness, paralysis or incoordination of the speech muscles (lips, tongue, palate, larynx, breathing) produces poorly articulated, slurred speech. It is a disorder of speech, not language: word choice, grammar and comprehension are intact, and writing is unaffected. It can result from damage to motor cortex, basal ganglia, cerebellum, brainstem or cranial nerves.' },

  { id:'hypophonia', answer:'Hypophonia', aliases:['hypophonic','soft voice','reduced voice volume','low voice volume'], cat:'lesion', unit:'L6', source:'Lecture 6 study guide',
    clues:[
      'The Lee Silverman Voice Treatment, developed in 1987 and named for a patient, trains people with it to "think loud."',
      'It is a classic feature of Parkinson\'s disease, whose patients often do not perceive that they are speaking too quietly.',
      'The lecture grouped it with dysarthria as a disturbance of speech, not of language.',
      'Dysarthria is slurred, poorly articulated speech; this is speech that is too quiet.',
      'Abnormally soft, weak speech output: a motor disorder of speech rather than of language.'],
    learn:'Abnormally soft, low-volume speech due to reduced vocal output, most characteristic of Parkinson\'s disease (reflecting reduced movement amplitude). Like dysarthria, it is a disorder of speech production, not of language. Treatments such as LSVT LOUD train patients to speak with more effort and loudness.' },

  { id:'arcuate_fasciculus', answer:'Arcuate fasciculus', aliases:['arcuate','arcuate fascicle','AF','arcuate tract','arcuate fasciculi'], cat:'anatomy', unit:'L6', source:'Lecture 6 study guide',
    clues:[
      'Comparative diffusion imaging (Rilling et al., 2008) found it far larger in humans than in chimpanzees or macaques, reaching much farther into the temporal lobe.',
      'Tractography (Catani et al., 2005) split it into a direct long segment and an indirect route that relays through inferior parietal cortex.',
      'In the classic model it originates in Wernicke\'s area, arches around the end of the lateral fissure past the angular gyrus, and ends in Broca\'s area.',
      'The corpus callosum connects the two hemispheres; this white-matter bundle connects language regions within the left hemisphere.',
      'The curved white-matter tract connecting Wernicke\'s area to Broca\'s area, whose damage is classically linked to conduction aphasia.'],
    learn:'A curved ("arcuate" means arched) white-matter tract that runs from the posterior temporal lobe (Wernicke\'s area), around the end of the lateral fissure, to the frontal lobe (Broca\'s area). It belongs to the superior longitudinal fasciculus system and is visualized with DTI tractography. In the classic Wernicke–Lichtheim–Geschwind model, damage to it disconnects comprehension from production, producing conduction aphasia (impaired repetition).' },

  { id:'conduction_aphasia', answer:'Conduction aphasia', aliases:['conduction','conduction aphasias','Leitungsaphasie'], cat:'lesion', unit:'L6', source:'Lecture 6 (types of aphasia)',
    clues:[
      'It was predicted from a diagram before it was observed: in 1874 Wernicke reasoned that cutting the connection between his area and Broca\'s should produce it.',
      'Patients make many phonemic paraphasias and approach targets in repeated attempts, while understanding both speech and print well.',
      'The lecture described it as a mild and rare disconnection syndrome: patients understand and speak fluently but have great difficulty repeating words and phrases said to them.',
      'The transcortical aphasias leave repetition intact; this aphasia impairs repetition while sparing comprehension.',
      'The aphasia classically caused by damage to the arcuate fasciculus, marked by impaired repetition.'],
    learn:'A fluent aphasia in which comprehension is good and speech is fluent (with phonemic paraphasias), but repetition is disproportionately impaired. Predicted by Wernicke (1874) as a disconnection between the posterior and anterior language areas, and classically attributed to damage to the arcuate fasciculus, although damage to the supramarginal gyrus and auditory cortex also contributes. Patients are aware of their errors and try to correct them.' },

  { id:'global_aphasia', answer:'Global aphasia', aliases:['global','total aphasia','global aphasias'], cat:'lesion', unit:'L6', source:'Lecture 6 (types of aphasia)',
    clues:[
      'It usually follows a large stroke from blockage of the left middle cerebral artery, which supplies nearly the whole perisylvian language region.',
      'Over months, some patients evolve into a severe Broca\'s-type aphasia as comprehension recovers more than production.',
      'The lecture described patients who may produce and understand only a handful of words and may not read or write at all.',
      'Broca\'s aphasia spares comprehension and Wernicke\'s spares fluency; this aphasia spares neither.',
      'The most severe aphasia, with loss of both production and comprehension of language, from large lesions affecting both Broca\'s and Wernicke\'s areas.'],
    learn:'The most severe aphasia: profound impairment of speech production, comprehension, repetition, reading and writing. Usually caused by a large left middle cerebral artery stroke damaging both anterior (Broca\'s) and posterior (Wernicke\'s) language regions. Patients may produce only a few words or stereotyped utterances; automatic speech and singing are sometimes spared.' },

  { id:'transcortical_motor', answer:'Transcortical motor aphasia', aliases:['transcortical motor','TCMA','TMA','transcortical motor aphasias'], cat:'lesion', unit:'L6', source:'Lecture 6 (types of aphasia)',
    clues:[
      'Lichtheim predicted it in 1885 from his "house" diagram, as the result of cutting the path from the concept center to the center for speech output.',
      'It often follows strokes in the anterior cerebral artery territory or the watershed zones, sparing Broca\'s area itself but damaging the frontal regions above or in front of it.',
      'The lecture described patients whose speech is halting, with many starts and stops, yet who repeat well.',
      'Broca\'s aphasia impairs both spontaneous speech and repetition; this nonfluent aphasia leaves repetition intact.',
      'A nonfluent aphasia with poor spontaneous speech but preserved repetition and comprehension.'],
    learn:'A nonfluent aphasia in which spontaneous speech is sparse and halting but repetition (and usually comprehension) is preserved. Caused by lesions that spare Broca\'s area and the perisylvian circuit but damage frontal regions above or in front of it (e.g. the supplementary motor area, in anterior cerebral artery or watershed territory), disconnecting conceptual processing from speech output. One of the syndromes predicted by the Wernicke–Lichtheim model.' },

  { id:'transcortical_sensory', answer:'Transcortical sensory aphasia', aliases:['transcortical sensory','TCSA','TSA','transcortical sensory aphasias'], cat:'lesion', unit:'L6', source:'Lecture 6 (types of aphasia)',
    clues:[
      'Lichtheim predicted it in 1885: a lesion cutting the path from the auditory word center to the concept center should abolish comprehension but leave repetition intact.',
      'Patients often show echolalia, automatically repeating the examiner\'s words, and lesions typically lie in the posterior watershed zone, sparing Wernicke\'s area itself.',
      'The lecture described patients with impaired auditory comprehension but intact repetition and fluent speech.',
      'Wernicke\'s aphasia impairs comprehension and repetition; this fluent aphasia impairs comprehension but spares repetition.',
      'A fluent aphasia with poor comprehension but preserved repetition.'],
    learn:'A fluent aphasia in which comprehension is impaired but repetition is preserved, often with echolalia (repeating what is heard). Caused by lesions that spare the perisylvian circuit (Wernicke\'s area, arcuate fasciculus, Broca\'s area) but isolate it from conceptual regions, typically in the posterior watershed region. Predicted by the Wernicke–Lichtheim model.' },

  { id:'wlg_model', answer:'Wernicke–Lichtheim–Geschwind model', aliases:['Wernicke-Lichtheim-Geschwind','Wernicke-Geschwind model','Geschwind model','Wernicke-Lichtheim model','Lichtheim model','Lichtheim\'s model','WLG model','classic model','classical model','classic language model','Lichtheim\'s house'], cat:'language', unit:'L6', source:'Lecture 6 (classic model of language)',
    clues:[
      'An American neurologist revived it in his 1965 paper "Disconnexion syndromes in animals and man," after decades in which holistic views of language had dominated.',
      'Its 1885 diagram, often called a "house," joins an auditory word center, a motor word center and a concept center, and predicts a different aphasia for a lesion of each center or connection.',
      'The lecture called it a useful first map: it predicts the classic aphasia syndromes from lesion sites and remains the bedside shorthand, but it oversimplifies the frontal "speech center" and leaves out the right hemisphere.',
      'The dual-stream model describes ventral and dorsal pathways through a broad network; this older model has two centers joined by a single white-matter tract.',
      'The 19th-century model of language, later revived, in which a posterior temporal comprehension area and a frontal production area are connected by the arcuate fasciculus.'],
    learn:'The classic model of language organization developed by Wernicke (1874) and Lichtheim (1885) and revived by Geschwind (1965): Wernicke\'s area stores the sound images of words (comprehension), Broca\'s area holds their motor programs (production), the arcuate fasciculus connects the two, and both connect to a distributed concept center. It predicts Broca\'s, Wernicke\'s, conduction and transcortical aphasias and remains clinically useful, but is now considered too simple: language relies on a broader left-hemisphere network with dorsal and ventral streams, and the right hemisphere contributes too.' },

  { id:'telegraphic_speech', answer:'Telegraphic speech', aliases:['agrammatism','agrammatic speech','agrammatic','telegraphic','telegrammatic speech','telegram style','agrammatic aphasia'], cat:'lesion', unit:'L6', source:'Lecture 6 (Broca\'s aphasia)',
    clues:[
      'Cross-language studies (Menn and Obler, 1990) found that in heavily inflected languages patients do not simply drop grammatical endings, which would leave nonwords, but substitute wrong ones.',
      'The words that disappear are the small, frequent, closed-class ones that carry structure, like "the," "to," "is" and verb endings, while content nouns survive.',
      'The lecture described Broca\'s aphasia output this way: slow and effortful and lacking function words, like a message paid for by the word.',
      'Paraphasias substitute wrong words or sounds; this pattern omits the grammatical words altogether and keeps the content words.',
      'Speech consisting mostly of content words, with function words and grammatical endings left out ("Walk dog… park"), characteristic of Broca\'s aphasia.'],
    learn:'Speech that omits function words (articles, prepositions, auxiliaries) and grammatical endings while keeping content words, like an old telegram ("Mother… hospital… yesterday"). Also called agrammatism. Characteristic of Broca\'s aphasia, and one reason Broca\'s aphasia was reinterpreted as a deficit of syntax.' },

  { id:'reversible_passive', answer:'Reversible passive', aliases:['reversible passives','reversible passive sentence','reversible passive sentences','reversible sentence','reversible sentences','passive sentence','passive sentences'], cat:'language', unit:'L6', source:'Lecture 6 (Caramazza & Zurif, 1976)',
    clues:[
      'Grodzinsky\'s trace-deletion hypothesis (1986) explained chance-level performance on them: the patient cannot link a moved noun phrase back to its original position, so must guess who did what.',
      'In these sentences either noun could plausibly do the action, so word knowledge cannot rescue you; only the syntax tells you who did it to whom.',
      'In the lecture\'s example, Broca\'s aphasics understood "The horse kicked the cow" but were at chance on "The horse was kicked by the cow": the syntax-dependent deficit Caramazza and Zurif (1976) reported.',
      'In "The apple was eaten by the boy," meaning alone tells you who ate what; in this kind of sentence, the roles could go either way.',
      'A sentence like "The horse was kicked by the cow," in which either noun could be the actor, so understanding it depends on syntax.'],
    learn:'A passive sentence in which both nouns could plausibly perform the action ("The horse was kicked by the cow"), so meaning and world knowledge cannot reveal who did what; only syntax can. Caramazza and Zurif (1976) showed that Broca\'s aphasics, whose everyday comprehension seemed intact, performed at chance on semantically reversible sentences whose meaning depends on syntax (they used center-embedded sentences; reversible passives show the same pattern), suggesting a syntactic deficit. Later work (e.g. Blank et al., 2016) showed that syntactic complexity engages the whole language network.' },

  { id:'paul_broca', answer:'Paul Broca', aliases:['Broca','Pierre Paul Broca','Dr. Broca'], cat:'history', unit:'L6', source:'Lecture 6 (Broca\'s aphasia)',
    clues:[
      'He founded the Société d\'Anthropologie de Paris in 1859, and in 1878 he named the "great limbic lobe" on the medial surface of the brain.',
      'In 1865 he summed up his conclusion in a famous line: "Nous parlons avec l\'hémisphère gauche," we speak with the left hemisphere.',
      'In 1861 he examined a patient at the Bicêtre hospital who could say only one syllable, and at autopsy six days later found a lesion in the left inferior frontal lobe.',
      'Carl Wernicke linked posterior temporal damage to loss of comprehension; this French physician linked frontal damage to loss of speech.',
      'The French physician whose patient "Tan" established that speech production depends on a region of the left frontal lobe now named after him.'],
    learn:'French physician and anthropologist (1824–1880). In 1861 he examined Louis Victor Leborgne ("Tan"), who could produce only a single syllable but understood speech; the autopsy showed a lesion of the left inferior frontal lobe. With further cases he concluded that articulate speech depends on the left frontal lobe ("we speak with the left hemisphere"), the first convincing evidence for localization of a cognitive function. Broca\'s area and Broca\'s aphasia are named after him.' },

  { id:'carl_wernicke', answer:'Carl Wernicke', aliases:['Wernicke','Karl Wernicke','Dr. Wernicke'], cat:'history', unit:'L6', source:'Lecture 6 (Wernicke\'s aphasia)',
    clues:[
      'An encephalopathy caused by thiamine deficiency, which often precedes Korsakoff\'s syndrome, also bears his name; he died in 1905 after a bicycling accident.',
      'He published his landmark monograph, The Aphasic Symptom Complex, in 1874 at age 26, proposing that a posterior area stores the "sound images" of words.',
      'From his model he predicted that cutting the link between the posterior and anterior speech areas would spare comprehension but fill speech with errors: conduction aphasia.',
      'Paul Broca linked frontal damage to loss of speech; this German neurologist linked posterior temporal damage to loss of comprehension.',
      'The German neurologist who described the fluent aphasia with impaired comprehension that bears his name, along with the temporal-lobe area named after him.'],
    learn:'German neurologist and psychiatrist (1848–1905). In 1874 he described patients with fluent but meaningless speech and impaired comprehension after posterior left temporal damage, and proposed a model linking a posterior auditory word area (Wernicke\'s area) to Broca\'s frontal motor area, predicting conduction aphasia. Extended by Lichtheim and later Geschwind, it became the classic Wernicke–Lichtheim–Geschwind model.' },

  { id:'tan', answer:'Patient Tan', aliases:['Tan','Leborgne','Louis Leborgne','Louis Victor Leborgne','Monsieur Leborgne','patient Leborgne','Tan Tan'], cat:'history', unit:'L6', source:'Lecture 6 (Broca\'s aphasia)',
    clues:[
      'A 2013 archival study identified him as a maker of shoe lasts born in 1809 in Moret-sur-Loing, overturning the legend that he was an illiterate, uneducated man from the lower class.',
      'His brain is preserved in Paris, and high-resolution MRI in 2007 showed that his lesion extended deep into medial regions and the superior longitudinal fasciculus.',
      'Admitted to the Bicêtre hospital in 1840 after losing the ability to speak, he could utter only one syllable, which became his nickname, though he understood speech.',
      'H.M. became the defining case for memory; this man became the defining case for speech production.',
      'Broca\'s first aphasic patient, whose only utterance gave him his nickname and whose left frontal lesion defined Broca\'s area.'],
    learn:'Louis Victor Leborgne (1809–1861), Paul Broca\'s first aphasic patient, known as "Tan" because it was nearly the only syllable he could produce. He understood speech. After his death in 1861 Broca found a lesion of the left inferior frontal lobe, establishing the link between that region and speech production. His preserved brain was imaged with MRI in 2007 (Dronkers et al.), revealing more extensive damage than Broca could see.' },

  { id:'split_brain', answer:'Split-brain', aliases:['split-brain patient','split-brain patients','callosotomy','corpus callosotomy','commissurotomy','split-brain surgery','split-brain syndrome'], cat:'lesion', unit:'L6', source:'Lecture 6 study guide',
    clues:[
      'When patient P.S.\'s left hemisphere saw a chicken claw and his right a snow scene, he explained his left hand\'s choice of a shovel by saying you need one to clean out the chicken shed: Gazzaniga\'s left-hemisphere "interpreter."',
      'Roger Sperry shared the 1981 Nobel Prize for studies of these patients, whose surgery was meant to keep epileptic seizures from spreading between the hemispheres.',
      'In the lecture, patient J.W. said he saw only "ring," the word flashed to his left hemisphere, yet his left hand picked out a key, the word flashed to his right.',
      'The Wada test silences one hemisphere temporarily with a drug; here the hemispheres are permanently disconnected by cutting the main fiber bundle between them.',
      'The condition after surgical cutting of the corpus callosum, which lets researchers test each hemisphere separately by flashing stimuli to one visual field.'],
    learn:'The condition of patients whose corpus callosum (and sometimes other commissures) was cut to treat intractable epilepsy, so the two hemispheres can no longer share information directly. By flashing stimuli to one visual field, researchers (Sperry, Gazzaniga) could test each hemisphere alone: the left hemisphere can name what it sees, while the right hemisphere cannot speak but can understand simple words and respond with the left hand. Split-brain studies showed that speech production is left-lateralized and that the right hemisphere has some language comprehension.' },

  { id:'corpus_callosum', answer:'Corpus callosum', aliases:['callosum','callosal','callosal fibers','corpora callosa','CC'], cat:'anatomy', unit:'L6', source:'Lecture 6 (split-brain studies)', lab:'MRI_Explorer.html',
    clues:[
      'Its name is Latin for "tough body," and with roughly 200 million axons it is the largest white-matter tract in the brain.',
      'From front to back its parts are the rostrum, genu, body and splenium; fibers through the splenium link the occipital lobes.',
      'Cutting it to stop the spread of epileptic seizures produced the split-brain patients in the lecture, whose hemispheres can be tested separately.',
      'The arcuate fasciculus connects language areas within one hemisphere; this connects the two hemispheres to each other.',
      'The large band of white matter connecting the left and right cerebral hemispheres.'],
    learn:'The largest commissure of the brain, a thick band of roughly 200 million axons connecting corresponding regions of the left and right hemispheres (rostrum, genu, body and splenium, from front to back). Surgically cutting it (callosotomy) to control epilepsy produces split-brain patients, whose hemispheres can be tested independently.' },

  { id:'visual_hemifield', answer:'Visual hemifield', aliases:['hemifield','hemifields','visual hemifields','left visual field','right visual field','divided visual field','divided visual field paradigm','visual half-field','lateralized presentation','hemifield presentation','LVF','RVF'], cat:'anatomy', unit:'L6', source:'Lecture 6 study guide',
    clues:[
      'Because a saccade can begin about 150 ms after a stimulus appears, experiments that exploit it flash stimuli very briefly, typically under 200 ms, while the participant fixates a central cross (Bourne, 2006).',
      'At the optic chiasm the fibers from the nasal half of each retina cross, so one side of space, seen by both eyes, reaches only the opposite side of the brain.',
      'The lecture\'s retinotopy slide: everything to the right of fixation projects to the left hemisphere, and everything to the left projects to the right hemisphere.',
      'A receptive field is the small patch of space that one neuron sees; this is the entire half of space on one side of the fixation point.',
      'One half of the visual field, left or right of fixation, which is processed by the opposite hemisphere; flashing a word to one is how split-brain studies reach a single hemisphere.'],
    learn:'One half (left or right) of the visual field relative to the point of fixation. Because fibers from the nasal half of each retina cross at the optic chiasm, the right visual hemifield projects to the left hemisphere and the left hemifield to the right hemisphere. Flashing a stimulus briefly (too fast for an eye movement) to one side of fixation therefore delivers it to one hemisphere only, which is how split-brain experiments test each hemisphere separately.' },

  { id:'wada_test', answer:'Wada test', aliases:['Wada','Wada procedure','Wada testing','Wada technique','intracarotid amobarbital test','intracarotid amobarbital procedure','intracarotid sodium amobarbital test','IAT','IAP','amobarbital test','sodium amytal test','amytal test'], cat:'methods', unit:'L6', source:'Lecture 6 (Wada testing)',
    clues:[
      'Its inventor first performed it in Japan in 1948, reported it in 1949, and later refined it at the Montreal Neurological Institute; today fMRI language mapping increasingly replaces it.',
      'A barbiturate, sodium amobarbital, is injected into one internal carotid artery, boosting GABA inhibition and anesthetizing one hemisphere for a few minutes.',
      'In the lecture, the patient holds up both hands and squeezes; when the injected hemisphere goes to sleep the opposite hand goes limp, and the team then tests speech and memory.',
      'Split-brain surgery disconnects the hemispheres permanently; this procedure silences one hemisphere temporarily to see what the other can do alone.',
      'The presurgical test that determines which hemisphere controls language by temporarily anesthetizing one hemisphere with a drug injected into the carotid artery.'],
    learn:'A presurgical procedure (Juhn Wada, first performed in 1948) in which a barbiturate (sodium amobarbital) is injected into one internal carotid artery, temporarily anesthetizing that hemisphere. Language and memory are tested while it is "asleep" to determine which hemisphere is dominant for language and whether the other can support memory, before epilepsy or tumor surgery. Wada testing of patients provided classic estimates of how often language is left-lateralized. Increasingly replaced by fMRI.' },

  { id:'planum_temporale', answer:'Planum temporale', aliases:['planum','plana temporalia','PT'], cat:'anatomy', unit:'L6', source:'Lecture 6 (anatomical asymmetries)', lab:'Cortex_Explorer.html',
    clues:[
      'Geschwind and Levitsky (1968) measured it in 100 postmortem brains and found it larger on the left in 65, larger on the right in 11, and equal in 24.',
      'It is a flat triangle of auditory association cortex on the upper surface of the temporal lobe, just behind Heschl\'s gyrus, hidden inside the lateral fissure.',
      'The lecture cited it as the best-known anatomical asymmetry related to language: slightly larger on the left in humans and great apes, but otherwise no gross differences.',
      'Heschl\'s gyrus is primary auditory cortex; this is the flat region just behind it, part of Wernicke\'s area.',
      'The region on the upper surface of the temporal lobe, behind primary auditory cortex, that tends to be larger in the left hemisphere: a classic structural asymmetry linked to language.'],
    learn:'A triangular region on the superior surface of the temporal lobe, behind Heschl\'s gyrus (primary auditory cortex), inside the lateral fissure; part of auditory association cortex and of Wernicke\'s area. It is larger in the left hemisphere in about two-thirds of brains (Geschwind and Levitsky, 1968), one of the few gross anatomical asymmetries related to language; a similar leftward tendency exists in great apes.' },

  { id:'lateralization', answer:'Language lateralization', aliases:['lateralization','lateralisation','language lateralisation','hemispheric specialization','hemispheric lateralization','hemispheric dominance','cerebral dominance','language dominance','left hemisphere dominance','left lateralization','lateralization of language','hemispheric asymmetry'], cat:'language', unit:'L6', source:'Lecture 6 study guide',
    clues:[
      'Knecht and colleagues (2000) measured it with blood-flow ultrasound in healthy people and found the atypical pattern in about 4% of strong right-handers but 27% of strong left-handers.',
      'Its anatomical correlates are subtle: a larger planum temporale, greater dendritic complexity, more white-matter connectivity and larger neurons in specific layers, all on one side.',
      'The lecture\'s numbers: it favors the left hemisphere in 98% of right-handed men and 90–95% of right-handed women, and it is more variable in left-handers.',
      'Prosody and pragmatics lean on the right hemisphere; this term describes the overall dominance of one hemisphere, usually the left, for core linguistic functions.',
      'The specialization of one cerebral hemisphere, usually the left, for language.'],
    learn:'The dominance of one hemisphere for language. Core language functions (speech production, word finding, grammar, comprehension) are left-lateralized in the great majority of people: about 98% of right-handed men and 90–95% of right-handed women in the lecture\'s figures, with more variability in left-handers. The right hemisphere contributes prosody, pragmatics, discourse, metaphor and humor. Evidence comes from lesions, Wada tests, split-brain studies and brain imaging.' },

  { id:'prosody', answer:'Prosody', aliases:['prosodic','speech melody','intonation','emotional prosody','affective prosody','linguistic prosody'], cat:'language', unit:'L6', source:'Lecture 6 (right hemisphere and language)',
    clues:[
      'Ross (1981) proposed that right-hemisphere lesions disrupt it in patterns that mirror the left hemisphere\'s aphasias, with "motor" and "sensory" forms.',
      'It is carried by pitch, loudness, timing and rhythm, and it signals emotion, emphasis, and whether a sentence is a question or a statement.',
      'The lecture\'s example was "Ann went to the store" said with different stresses; patients with right-hemisphere lesions may be unable to produce or appreciate it.',
      'Syntax is the structure of the words; this is the melody and stress of how they are said.',
      'The melody, rhythm and stress of speech, which depends heavily on the right hemisphere.'],
    learn:'The "music" of speech: pitch (intonation), loudness, stress and timing, which convey emphasis, sentence type (question vs. statement) and emotion. Producing and perceiving prosody depend heavily on the right hemisphere; right-hemisphere lesions can cause aprosodia (flat, unexpressive speech or failure to grasp emotional tone).' },

  { id:'pragmatics', answer:'Pragmatics', aliases:['pragmatic','pragmatic language','pragmatic knowledge','pragmatic inference','conversational implicature','implicature'], cat:'language', unit:'L6', source:'Lecture 6 (what is language?)',
    clues:[
      'The philosopher Paul Grice (1975) argued it rests on shared "maxims" of conversation (quantity, quality, relation and manner) that listeners assume speakers are following.',
      'It explains how "It\'s cold in here" can be a request to close the window: the intended meaning goes beyond the literal one.',
      'In the lecture\'s example, a right-hemisphere patient asked "Can you open the door?" answers "Yes" and does nothing.',
      'Semantics is the literal meaning of words and sentences; this is what a speaker actually means by them in context.',
      'The aspect of language concerned with how we understand what someone actually means, which can differ from the literal meaning of their words.'],
    learn:'The use and interpretation of language in context: understanding what a speaker intends (requests, sarcasm, jokes, metaphors, implications) beyond the literal meaning of the words. One of the components of language in the lecture, alongside phonology, semantics and syntax, and one that depends substantially on the right hemisphere: right-hemisphere patients may interpret indirect requests literally.' },

  { id:'phonology', answer:'Phonology', aliases:['phonological','phonological system','phonological structure'], cat:'language', unit:'L6', source:'Lecture 6 (what is language?)',
    clues:[
      'Werker and Tees (1984) showed that English-learning infants can distinguish Hindi and Salish speech sounds at 6–8 months but have mostly lost that ability by 10–12 months.',
      'Its basic units distinguish meaning, like /p/ and /b/ in "pat" and "bat"; English uses roughly 44 of them, and languages range from about a dozen to over a hundred.',
      'The first component in the lecture\'s list of what language is: the sounds of language.',
      'Semantics deals with meaning and syntax with structure; this deals with sound.',
      'The sound system of a language: its inventory of speech sounds and the rules for combining them.'],
    learn:'The sound structure of language: the inventory of phonemes (sound units that distinguish meaning, like /p/ vs. /b/) and the rules for combining them into syllables and words. One of the four components of language in the lecture, with semantics, syntax and pragmatics. Infants tune their speech perception to their native language within the first year.' },

  { id:'semantics', answer:'Semantics', aliases:['lexical semantics','sentence semantics','compositional semantics'], cat:'language', unit:'L6', source:'Lecture 6 (what is language?)',
    clues:[
      'Kutas and Hillyard (1980) discovered an ERP wave, peaking about 400 ms after a word, that is much larger at the end of "He spread the warm bread with socks."',
      'It applies at two levels: the meanings of individual words in the mental lexicon, and how those meanings combine into the meaning of a sentence.',
      'The lecture\'s second component of language: the meaning of words and word combinations.',
      'Phonology is the sound of language and syntax its structure; this is its meaning.',
      'The aspect of language concerned with the meaning of words and of the sentences they form.'],
    learn:'The meaning of words and of their combinations into phrases and sentences. One of the four components of language (with phonology, syntax and pragmatics). Violations of meaning ("He spread the warm bread with socks") evoke the N400 ERP component. In the early linguistic revision of aphasia, Wernicke\'s area was associated with semantics and the lexicon, but modern work finds that every language region tracks both meaning and structure.' },

  { id:'syntax', answer:'Syntax', aliases:['grammar','syntactic','syntactic structure','sentence structure','grammatical structure','syntactic processing'], cat:'language', unit:'L6', source:'Lecture 6 (what is language?)',
    clues:[
      'Chomsky\'s 1957 sentence "Colorless green ideas sleep furiously" was built to show that it is independent of meaning: the sentence is nonsense yet perfectly well formed.',
      'Sentences that break it, or lead the reader down the wrong structural path ("The broker persuaded to sell the stock…"), evoke a late positive ERP wave around 600 ms (Osterhout and Holcomb, 1992).',
      'The lecture\'s example: "Shark bites man" and "Man bites shark" use the same words, but the order changes who does what to whom.',
      'Semantics is what the words mean; this is the set of rules for how they are arranged into sentences.',
      'The structure of a language: the rules governing word order and how sentences are built, which determine their meaning.'],
    learn:'The rules that govern the structure of sentences in a language, including word order and how words combine into phrases, which determine relationships of meaning ("Shark bites man" vs. "Man bites shark"). One of the four components of language. Broca\'s aphasia was reinterpreted as a syntactic deficit after Caramazza and Zurif (1976), but syntactic processing turns out to be distributed across the whole left-hemisphere language network (Blank et al., 2016).' },

  { id:'mental_lexicon', answer:'Mental lexicon', aliases:['lexicon','mental dictionary','lexical memory','mental lexicons'], cat:'language', unit:'L6', source:'Lecture 6 (neural circuits for language)',
    clues:[
      'In Marslen-Wilson\'s cohort model (1978), hearing "cap…" briefly activates every matching entry, like "captain" and "capital," until later sounds rule all but one out.',
      'In Levelt\'s model each entry has a lemma (its meaning and grammatical properties) and a word form (its sounds), and a tip-of-the-tongue state is having the first without the second.',
      'It is not merely a list of words: each entry includes phonological, morphological, semantic and syntactic information, and similar concepts sit "close" together; a typical 20-year-old knows about 42,000 lemmas.',
      'Syntax is the set of rules for combining words; this is the store of the words themselves.',
      'The store of words in long-term memory and the information about each of them, organized as a semantic network.'],
    learn:'The mental store of words and everything a speaker knows about each one: its sound (phonological), parts (morphological), meaning (semantic) and grammatical (syntactic) properties. It is organized as a network in which related words are linked and activation spreads between them. Adults know tens of thousands of words (about 42,000 lemmas by age 20).' },

  { id:'language_network', answer:'Language network', aliases:['core language network','language system','left hemisphere language network','frontotemporal language network','fronto-temporal language network','perisylvian language network','perisylvian network','high-level language network','language regions','language areas'], cat:'language', unit:'L6', source:'Lecture 6 (conclusions)',
    clues:[
      'Its standard functional localizer contrasts reading sentences with reading lists of pronounceable nonwords (Fedorenko et al., 2010).',
      'Its regions respond when people understand sentences, spoken or written, but not during mental arithmetic, working-memory tasks, cognitive-control tasks or music (Fedorenko et al., 2011).',
      'Each person\'s version sits in a slightly different place, so group averages blur it; precision fMRI has mapped it in 1,199 individual brains.',
      'The Wernicke–Lichtheim–Geschwind model had two centers and one tract; this modern view is a set of left frontal and temporal regions that handle words and grammar together.',
      'The set of left-hemisphere frontal and temporal regions that respond selectively to words and sentences, but not to math or music.'],
    learn:'A set of left-lateralized frontal and temporal regions around the lateral (Sylvian) fissure that respond selectively during language comprehension and production, whether spoken, written or signed, and that process word meanings and sentence structure together. Its regions are not engaged by arithmetic, working memory, cognitive control or music (Fedorenko et al., 2011), supporting the view that language is distinct from other thought. Its precise location varies across individuals, so it is best mapped in each person with a functional localizer.' },

  { id:'dual_stream', answer:'Dual-stream model', aliases:['dual-stream','dual-stream model of speech','two-stream model','two streams model','dual pathway model','Hickok and Poeppel model','Hickok & Poeppel model','dorsal and ventral streams','ventral and dorsal streams'], cat:'language', unit:'L6', source:'Lecture 6 (conclusions)',
    clues:[
      'It borrowed its layout from vision\'s "what" and "where" pathways (Ungerleider and Mishkin), and in its speech version one pathway is largely bilateral while the other is strongly left-dominant.',
      'One route runs from auditory cortex down and forward through the temporal lobe to meaning; the other runs up through the temporal–parietal boundary to frontal articulation areas.',
      'In the lecture\'s modern view of language, a ventral pathway maps sound to meaning and a dorsal pathway maps sound to speech.',
      'The Wernicke–Lichtheim–Geschwind model links two centers with one tract; this model describes two parallel pathways for processing speech sounds.',
      'The model of speech processing with a ventral pathway (sound to meaning) and a dorsal pathway (sound to articulation).'],
    learn:'The model of speech processing proposed by Hickok and Poeppel (2000; fullest version 2007): after early auditory analysis in superior temporal cortex, a ventral stream through the temporal lobe maps speech sounds onto meaning (comprehension; largely bilateral), and a dorsal stream through the temporal–parietal boundary to frontal cortex maps sounds onto articulation (production and repetition; left-dominant). It replaced the two-center classic model as a description of language pathways.' },

  { id:'speech_arrest', answer:'Speech arrest', aliases:['speech arrests','arrest of speech','stimulation-induced speech arrest'], cat:'methods', unit:'L6', source:'Lecture 6 (Broca\'s region)',
    clues:[
      'In a 1989 study of 117 patients, Ojemann, Berger and colleagues found that the cortical sites where stimulation disrupted language were small, often a square centimeter or two, and that their locations varied widely between patients.',
      'It is elicited in awake patients by brief, low-current pulses through an electrode on the cortical surface while they count or name pictures, and it ends the moment the current stops.',
      'The lecture traced it from Penfield\'s 1950s maps to modern awake surgery by Mitch Berger: stimulating frontal language cortex suddenly stops a patient mid-sentence.',
      'A lesion causes lasting aphasia; this is a temporary, reversible halt in talking caused by electrically stimulating the cortex.',
      'The sudden inability to keep talking while a site of language cortex is electrically stimulated during awake brain surgery, used to map areas that must be spared.'],
    learn:'A sudden, temporary inability to continue speaking while a cortical site is electrically stimulated in an awake patient. Mapped systematically by Wilder Penfield and used today in awake neurosurgery (e.g. by Mitch Berger at UCSF) to identify language cortex that must be spared. Sites that produce it are often found in the posterior inferior frontal region (Broca\'s area and ventral premotor cortex), but their locations vary between individuals.' },

  /* ---------------------------- LECTURE 7 ---------------------------- */
  { id:'receptive_field', answer:'Receptive field', aliases:['receptive fields','RF','RFs','visual receptive field','visual receptive fields'], cat:'vision', unit:'L7', source:'Lecture 7 study guide',
    clues:[
      'Sherrington coined the term in 1906 for the patch of skin that triggers a dog\'s scratch reflex; Hartline (1938) carried it over to single optic-nerve fibers of the frog.',
      'It is smallest for neurons that represent the center of gaze, and it grows toward the periphery and at each step up the visual hierarchy.',
      'In the lecture\'s first clip, a spot wandered across the screen and one LGN neuron fired only when the spot crossed its own small patch; rotating a bar there made no difference.',
      'An fMRI voxel\'s patch of the visual field pools many neurons; this patch belongs to a single neuron.',
      'The region of the visual field (or of the skin) in which a stimulus changes a particular neuron\'s firing.'],
    learn:'The region of the sensory surface (for vision, the part of the visual field) where a stimulus changes a given neuron\'s firing. LGN neurons have small, circular center-surround receptive fields; V1 simple and complex cells have elongated ones tuned to orientation. Receptive fields are smallest at the center of gaze, grow with eccentricity, and grow at each stage of the visual hierarchy. Neighboring neurons have neighboring receptive fields, which is what produces retinotopic maps.' },

  { id:'center_surround', answer:'Center-surround receptive field', aliases:['center-surround','centre-surround','center-surround organization','center-surround antagonism','on-center off-surround','on-center','off-center','concentric receptive field'], cat:'vision', unit:'L7', source:'Lecture 7 study guide',
    clues:[
      'Kuffler described it in 1953 from single ganglion cells in the intact cat eye, and Barlow reported a similar arrangement in the frog the same year.',
      'It is modeled as a difference of Gaussians, a narrow Gaussian minus a broader, shallower one, so a uniform field of light barely drives the cell.',
      'The lecture\'s LGN neurons had round fields like this (the clips drew only the middle), which is why the orientation of a bar did not matter to them.',
      'A simple cell\'s field is elongated and prefers one orientation; this circular field has no preferred orientation.',
      'The circular field of retinal ganglion cells and LGN neurons, in which light in the middle and light in the ring around it have opposite effects.'],
    learn:'The receptive field organization of retinal ganglion cells and LGN neurons: a small circular center and a surrounding ring with opposite effects (on-center/off-surround or off-center/on-surround). Such cells respond best to a spot or edge of the right size and poorly to uniform light, and they are insensitive to orientation. Hubel and Wiesel proposed that V1 simple cells get their orientation preference by combining several of these inputs lined up in a row.' },

  { id:'simple_cell', answer:'Simple cell', aliases:['simple cells','V1 simple cell','V1 simple cells','simple-type cell'], cat:'vision', unit:'L7', source:'Lecture 7 study guide',
    clues:[
      'Hubel and Wiesel (1962) chose its name because small spots of light divided its field into separate excitatory and inhibitory zones, from which its response to any bar could be predicted.',
      'To a drifting grating it fires in bursts, one per cycle, as light and dark stripes cross its zones; this modulation is a standard test for it.',
      'In the lecture\'s model, five LGN neurons in a vertical line were wired to one V1 neuron: only a vertical bar drove all five at once and pushed the summed input past threshold.',
      'A complex cell responds to its preferred orientation anywhere in its receptive field; this cell responds only when the bar falls in one exact position.',
      'A V1 neuron with an elongated receptive field, built from LGN inputs arranged in a line, that responds to a bar of one orientation at one position.'],
    learn:'A type of neuron in primary visual cortex (V1), described by Hubel and Wiesel, with an elongated receptive field divided into excitatory and inhibitory zones. It responds best to a bar or edge of a particular orientation at a particular position. Its orientation preference is thought to come from its wiring: it sums input from several center-surround LGN neurons whose receptive fields lie in a row, so only a bar with that orientation activates enough of them at once to cross threshold. Rewiring the same inputs changes the preferred orientation.' },

  { id:'complex_cell', answer:'Complex cell', aliases:['complex cells','V1 complex cell','V1 complex cells','complex-type cell'], cat:'vision', unit:'L7', source:'Lecture 7 study guide',
    clues:[
      'Hubel and Wiesel gave it its name because, unlike its partner type, its response to a moving bar could not be predicted by mapping its field with small spots of light.',
      'To a drifting grating it gives a steady rise in firing rather than a burst each cycle, a standard test that sets it apart from its partner type.',
      'In the lecture\'s model it pooled five neurons that each preferred a vertical bar at a different position, so it stayed selective for orientation but tolerated changes in position.',
      'A simple cell responds to its preferred bar at only one position; this cell responds to it anywhere in its receptive field.',
      'A V1 neuron that responds to a bar of one orientation regardless of its exact position, thought to pool the outputs of several simple cells.'],
    learn:'A type of V1 neuron, described by Hubel and Wiesel, that responds to a line or edge of a particular orientation anywhere within its receptive field (position tolerance), often preferring motion in one direction. In their hierarchical model it pools several simple cells with the same preferred orientation at different positions. Convergence builds selectivity; pooling builds tolerance. Convolutional neural networks borrow this two-step design.' },

  { id:'hubel_wiesel', answer:'Hubel and Wiesel', aliases:['Hubel & Wiesel','David Hubel','Torsten Wiesel','Hubel','Wiesel','David Hubel and Torsten Wiesel'], cat:'history', unit:'L7', source:'Lecture 7 (computation is connectivity)',
    clues:[
      'Their half of the 1981 Nobel Prize in Physiology or Medicine honored discoveries about information processing in the visual system; Roger Sperry won the other half.',
      'Their first strongly orientation-selective neuron was found by accident in 1958, when the edge of a glass slide sliding into their projector swept a faint line across the cat\'s retina.',
      'The lecture credited them with the wiring diagram behind simple and complex cells (1962): line up LGN inputs to get orientation, then pool those cells to get tolerance to position.',
      'Penfield stimulated human cortex to see what it does; this pair recorded single neurons in the visual cortex of cats and monkeys to see what they respond to.',
      'The two neurophysiologists who discovered orientation-selective simple and complex cells in primary visual cortex.'],
    learn:'David Hubel and Torsten Wiesel, neurophysiologists who recorded single neurons in the visual cortex of cats and monkeys from the late 1950s on. They discovered that V1 neurons respond to oriented bars and edges, classified simple and complex cells (1962), proposed that these properties arise from the way inputs are wired (LGN cells in a row make a simple cell; simple cells pooled make a complex cell), and described ocular dominance columns and critical periods in development. They shared the 1981 Nobel Prize with Roger Sperry.' },

  { id:'cnn', answer:'Convolutional neural network', aliases:['CNN','CNNs','convolutional neural networks','convolutional neural net','convolutional network','convolutional networks','convnet','deep convolutional neural network','DCNN'], cat:'connectivity', unit:'L7', source:'Lecture 7 (computation is connectivity)',
    clues:[
      'Its ancestor was Kunihiko Fukushima\'s 1980 neocognitron, and the version that won the 2012 ImageNet image-recognition contest (AlexNet) set off the deep-learning boom.',
      'Each of its filtering layers slides the same small set of learned weights across the image, so a detector for an edge or texture works at every position; pooling layers then add tolerance to shifts.',
      'The lecture tied it to V1: it alternates layers modeled on simple and complex cells, and training changes its connection weights while the units themselves stay the same.',
      'Simple and complex cells are neurons in V1; this is an artificial system built by stacking many layers of units modeled on them.',
      'A deep learning architecture for recognizing images, built from alternating layers that detect local features and pool them, inspired by V1 simple and complex cells.'],
    learn:'An artificial neural network for vision built from stacked layers. Convolutional layers apply the same small filter at every image position (like many simple cells tuned to the same feature), and pooling layers combine neighboring outputs (like complex cells), giving tolerance to position. Stacking these steps yields units that respond to increasingly complex shapes and objects. Inspired by Hubel and Wiesel through Fukushima\'s neocognitron (1980); learning changes the connection weights, not the units.' },

  { id:'connectome', answer:'Connectome', aliases:['connectomes','connectomics','wiring diagram','complete wiring diagram','synaptic wiring diagram','neural wiring diagram'], cat:'connectivity', unit:'L7', source:'Lecture 7 (fly connectome)',
    clues:[
      'The first complete one, for the roundworm C. elegans (302 neurons), was traced by hand from electron micrographs and published by White, Southgate, Thomson and Brenner in 1986.',
      'Mapping one at synapse resolution takes electron microscopy, because synaptic clefts and the finest branches are only tens of nanometers wide, then AI tracing of every neuron and years of human proofreading.',
      'The lecture\'s 2026 example covered a male fruit fly\'s whole central nervous system: about 166,000 neurons, 125 million synaptic connections and 11,710 cell types.',
      'Tractography estimates bundles between millimeter-sized regions; this is the map of which individual neurons connect to which.',
      'A complete map of the neural connections in a nervous system, ideally down to every synapse.'],
    learn:'A complete map of the connections in a nervous system. At the finest scale it lists every neuron and synapse, which requires electron microscopy, AI-based reconstruction and extensive human proofreading. Synapse-level maps exist for the worm C. elegans (302 neurons), the adult female fruit fly brain (2024) and, as of 2026, the whole male fruit fly central nervous system (about 166,000 neurons and 125 million connections; Berg et al., 2026). A human connectome at that resolution is far out of reach (86 billion neurons, roughly a zettabyte of data), so human connectivity is studied at the millimeter scale with MRI.' },

  { id:'electron_microscopy', answer:'Electron microscopy', aliases:['EM','electron microscope','electron microscopes','FIB-SEM','focused ion beam scanning electron microscopy','volume electron microscopy','serial section electron microscopy','scanning electron microscopy'], cat:'methods', unit:'L7', source:'Lecture 7 (fly connectome)',
    clues:[
      'Ernst Ruska built the first working instrument of this kind with Max Knoll in 1931 and received a Nobel Prize for it 55 years later.',
      'It forms images with a beam of charged particles instead of light; their far shorter wavelength resolves structures only a few nanometers across.',
      'For the fly connectome, seven of these instruments imaged the tissue surface while an ion beam shaved off a few nanometers at a time, for 13 months at 8 nm resolution.',
      'MRI resolves millimeters in a living person; this method resolves individual synapses, but only in dead, fixed tissue.',
      'The imaging method needed to map synapses, which are too small for light microscopes, and used to build synapse-level connectomes.'],
    learn:'Imaging with a beam of electrons rather than light, which resolves structures down to a few nanometers: synaptic vesicles, synaptic clefts and the thinnest axons. Volume methods such as FIB-SEM (an ion beam mills away the surface a few nanometers at a time between images) produce 3-D image stacks from which every neuron and synapse can be traced. It requires fixed, stained tissue, so it cannot be used in living people. It is the basis of synapse-level connectomes such as the 2026 fruit fly map.' },

  { id:'structural_connectivity', answer:'Structural connectivity', aliases:['anatomical connectivity','structural connection','structural connections','anatomical connections','structural connectome','white matter connectivity','structural network'], cat:'connectivity', unit:'L7', source:'Lecture 7 (types of connectivity)',
    clues:[
      'Before MRI it could be studied in humans only after death, by dissecting fiber bundles; in animals it is still measured most directly by injecting tracers that neurons carry along their axons.',
      'In living people it is estimated with diffusion MRI and tractography, which infer fiber bundles from the direction water diffuses, and the reconstructions include many tracts that do not exist.',
      'The lecture defined it as the physical tracts between brain areas, and showed it guiding deep brain stimulation for depression and changing after people learned to juggle.',
      'Functional connectivity is correlated activity between areas; this is the set of physical pathways that link them.',
      'Connectivity defined by the physical, anatomical links between brain regions, such as white-matter tracts.'],
    learn:'The physical, anatomical connections between brain regions: axons and the white-matter tracts they form. In living humans it is estimated with diffusion MRI (DTI and tractography); in animals it can be measured directly with tracer injections; at the finest scale it is a synapse-level connectome. It constrains but does not determine functional connectivity: strongly correlated regions need not be directly connected. Lecture examples: tractography-guided DBS for depression, and white-matter changes after juggling training.' },

  { id:'functional_connectivity', answer:'Functional connectivity', aliases:['FC','functional connection','functional connections','functional coupling','fcMRI','functional connectivity MRI','functional connectome','BOLD correlation'], cat:'connectivity', unit:'L7', source:'Lecture 7 study guide', lab:'Network_Explorer.html',
    clues:[
      'The idea came from correlating spike trains recorded with many electrodes; Friston and colleagues (1993) carried it over to whole-brain PET scans.',
      'It is usually computed as the Pearson correlation between two regions\' BOLD time series: +1 means they rise and fall in step, 0 that they are unrelated, -1 that they move in opposite directions.',
      'In the lecture\'s real resting scan, one voxel in the posterior cingulate and one in medial prefrontal cortex, 10 cm apart, correlated at r = 0.78.',
      'Structural connectivity is the physical wiring between regions; this is the statistical relationship between their activity, which can exist without any direct wire.',
      'Correlation in activity (usually the BOLD signal) between brain regions over time, taken as evidence that they work together.'],
    learn:'Statistical dependence, usually correlation, between the activity time series of different brain regions, most often measured with fMRI (BOLD) at rest or during a task. Regions whose signals rise and fall together are said to be functionally connected or coupled; a negative correlation suggests opposing activity; zero suggests no coupling. Seed-based maps and connectivity matrices are built from it. Correlation is not causation: a shared input, an indirect route, head motion or breathing can all produce it, and it says nothing about direction.' },

  { id:'brownian_motion', answer:'Brownian motion', aliases:['Brownian movement','Brownian diffusion','pedesis','random thermal motion'], cat:'methods', unit:'L7', source:'Lecture 7 (diffusion tensor imaging)',
    clues:[
      'Jan Ingenhousz described it in charcoal dust in 1784 and 1785, four decades before the observer whose name it now carries.',
      'The average distance a molecule wanders grows only with the square root of time: in the tens of milliseconds of an MRI measurement, water in tissue moves about ten micrometers, the width of several axons.',
      'The lecture named it after a Scottish botanist who in 1827 watched tiny particles from pollen grains of Clarkia pulchella jitter endlessly in water under his microscope.',
      'Diffusion tensor imaging measures which way water spreads; this is the random jiggling of individual molecules that makes it spread in the first place.',
      'The random, jittery movement of particles suspended in a fluid, caused by collisions with its molecules; the physical basis of diffusion MRI.'],
    learn:'The random motion of small particles or molecules in a fluid, driven by thermal collisions. Jan Ingenhousz saw it in charcoal dust in the 1780s and Robert Brown in particles from pollen grains in 1827; Einstein explained it in 1905, and Perrin\'s measurements of it helped confirm that atoms exist. Water molecules in the brain wander this way, and diffusion MRI measures how far and in which directions they spread: equally in all directions in free fluid (isotropic), mainly along the fibers in white matter (anisotropic).' },

  { id:'isotropic_diffusion', answer:'Isotropic diffusion', aliases:['isotropic','isotropy','isotropic water diffusion','free diffusion','unrestricted diffusion'], cat:'methods', unit:'L7', source:'Lecture 7 study guide',
    clues:[
      'Gray matter comes close to it at the scale of an MRI voxel, because its fibers run every which way; crossing fiber bundles in white matter can mimic it too.',
      'In the tensor model its ellipsoid is a perfect sphere, with all three axes equal, and its FA is 0.',
      'The lecture\'s animation showed it on the left: a drop of water molecules spreading out as an expanding circle in free fluid such as cerebrospinal fluid.',
      'In white matter, axon membranes make water spread mainly along the fibers; here nothing stands in the way, so it spreads equally in every direction.',
      'Movement of water that is equal in all directions, as in cerebrospinal fluid, where there are no barriers.'],
    learn:'Diffusion that is the same in all directions, so that a drop of labeled water molecules spreads as a sphere. It occurs in free fluid such as cerebrospinal fluid, where there are no barriers, and its fractional anisotropy is 0. Gray matter is nearly isotropic at MRI resolution. Contrast with anisotropic diffusion in white matter, where water moves more easily along axons than across them.' },

  { id:'anisotropic_diffusion', answer:'Anisotropic diffusion', aliases:['anisotropic','anisotropy','diffusion anisotropy','directional diffusion','anisotropic water diffusion'], cat:'methods', unit:'L7', source:'Lecture 7 study guide',
    clues:[
      'Beaulieu\'s 2002 review concluded that it comes mainly from the axon membranes themselves: myelin strengthens it, but nerves without myelin show it too.',
      'Fit with a tensor, it gives an elongated ellipsoid whose long axis points along the local fibers; DTI color maps show that axis as red (left-right), green (front-back) or blue (up-down).',
      'The lecture\'s animation showed it on the right: water molecules in white matter bounce off the axon walls and spread mainly along the fibers.',
      'In cerebrospinal fluid water spreads equally in all directions; in white matter it spreads much farther along the axons than across them.',
      'Movement of water that is greater in one direction than in others, as in white matter, where axons act as barriers.'],
    learn:'Diffusion that differs by direction. In white matter, axon membranes (and myelin) block water moving across the fibers, so it spreads mainly along them and a drop spreads as an elongated ellipsoid. DTI measures this in each voxel: the direction of the long axis indicates fiber orientation (used for tractography), and the degree of elongation is summarized as fractional anisotropy (FA). Contrast with isotropic diffusion in cerebrospinal fluid.' },

  { id:'fractional_anisotropy', answer:'Fractional anisotropy', aliases:['FA','FA value','fractional anisotropy index'], cat:'methods', unit:'L7', source:'Lecture 7 (learning to juggle changes white matter)',
    clues:[
      'Basser and Pierpaoli defined it in the mid-1990s as a rotation-invariant index, so its value does not depend on how the head or the fibers are oriented in the scanner.',
      'Computed from the tensor\'s three eigenvalues, it is their spread around the mean scaled by their overall size; the corpus callosum has some of the highest values in the brain.',
      'In the lecture\'s juggling study (Scholz et al., 2009), it rose in white matter beneath the right intraparietal sulcus after six weeks of training and was still raised four weeks after practice stopped.',
      'The color in a DTI map shows which way fibers run; this single number shows how strongly the spread of water is directional, and is often read as "integrity."',
      'The DTI measure, from 0 to 1, of how directional water diffusion is in a voxel, often used as an index of white-matter integrity.'],
    learn:'A number from 0 to 1 computed from the diffusion tensor in each voxel: 0 when water diffuses equally in all directions (isotropic, as in cerebrospinal fluid), approaching 1 when it diffuses along a single axis (as in tightly packed parallel axons). It is often described as white-matter "integrity," though it is also affected by crossing fibers, axon density and myelination. Scholz et al. (2009) found it increased in parietal white matter after juggling training, and the increase did not track how well people juggled.' },

  { id:'seed_based', answer:'Seed-based connectivity', aliases:['seed-based correlation','seed-based analysis','seed-based mapping','seed-based connectivity mapping','seed-based functional connectivity','seed-based correlation analysis','seed map','seed correlation','seed region','seed voxel'], cat:'connectivity', unit:'L7', source:'Lecture 7 study guide',
    clues:[
      'Biswal and colleagues (1995) introduced it: from voxels in motor cortex found with a finger-tapping task, they mapped which other resting voxels fluctuated in step.',
      'Its result depends entirely on the starting point chosen: another starting region in the same network gives a similar map, while one in a different network gives a different map.',
      'In the lecture\'s real scan, one voxel in the posterior cingulate was correlated with every voxel in the brain (34,418 correlations), and keeping the strong ones revealed the default mode network.',
      'A connectivity matrix correlates every region with every other region at once; this approach correlates one chosen region with the rest of the brain.',
      'Mapping connectivity by correlating the time series of one chosen voxel or region with that of every other voxel in the brain.'],
    learn:'A functional connectivity method: choose a starting voxel or region (the seed), extract its BOLD time series, and correlate it with the time series of every other voxel. Coloring each voxel by its correlation gives a map of the regions that fluctuate with the seed, that is, the seed\'s functional network. Different seeds reveal different networks (default mode, somatomotor, visual). Introduced by Biswal et al. (1995) for resting motor cortex.' },

  { id:'resting_state', answer:'Resting-state fMRI', aliases:['resting state','resting-state','rs-fMRI','rsfMRI','resting-state functional connectivity','RSFC','resting-state functional MRI','rest fMRI','resting-state scan','resting-state networks','intrinsic connectivity'], cat:'connectivity', unit:'L7', source:'Lecture 7 (functional connectivity)', lab:'Network_Explorer.html',
    clues:[
      'Analyzing 1,147 of these scans, Tagliazucchi and Laufs (2014) concluded that about a third of participants lose wakefulness within the first three minutes.',
      'Its correlations come from slow, spontaneous BOLD fluctuations below about 0.1 Hz, so the data are filtered to that band and cleaned of head-motion, white-matter and fluid signals.',
      'The lecture\'s explainer clips used a 7-minute scan of one person lying still with no task: 210 brain volumes, one every 2 seconds.',
      'Task fMRI compares activity between the conditions of an experiment; this records spontaneous activity while the person does nothing in particular.',
      'Brain scanning while a person lies quietly with no task, used to measure functional connectivity from spontaneous fluctuations in activity.'],
    learn:'Functional MRI recorded while a person lies in the scanner without performing a task (eyes closed or fixating), typically for 5 to 15 minutes. Correlations among the slow, spontaneous BOLD fluctuations reveal reproducible networks such as the default mode, somatomotor and visual networks (Biswal et al., 1995; Yeo et al., 2011). It is easy to collect, even in patients, but "rest" is uncontrolled: people mind-wander, move and often fall asleep.' },

  { id:'dmn', answer:'Default mode network', aliases:['DMN','default network','default mode','task-negative network','default mode system','default system'], cat:'connectivity', unit:'L7', source:'Lecture 7 study guide', lab:'Network_Explorer.html',
    clues:[
      'Shulman and colleagues (1997) first noticed it by pooling nine PET studies of visual tasks against passive viewing; Raichle et al. (2001) gave it its name.',
      'Greicius and colleagues (2003) showed that its regions also fluctuate together at rest, using seeds in the posterior cingulate and ventral anterior cingulate cortex.',
      'In the lecture, it was active at rest and during mind-wandering and "turned off" during tasks, and its disruption has been linked to ADHD, autism, Alzheimer\'s disease, depression and schizophrenia.',
      'The dorsal attention network rises when you focus on an external task; this network falls then, and rises when your mind wanders.',
      'The network of medial prefrontal, posterior cingulate, precuneus and inferior parietal regions that is active at rest and during mind-wandering and deactivates during tasks.'],
    learn:'A large-scale brain network including medial prefrontal cortex, posterior cingulate cortex and precuneus, inferior parietal lobule, lateral temporal cortex and the hippocampal formation. It is most active at rest and during internally directed thought (mind-wandering, remembering, imagining the future, thinking about others) and decreases during externally focused tasks. It was discovered from task-induced decreases in PET (Shulman et al., 1997; named by Raichle et al., 2001) and confirmed with resting-state functional connectivity (Greicius et al., 2003). It is altered in ADHD, autism, Alzheimer\'s disease, depression and other disorders.' },

  { id:'anticorrelation', answer:'Anticorrelation', aliases:['anticorrelations','anticorrelated','anti-correlation','anti-correlated','negative correlation','negatively correlated','inverse correlation','negative functional connectivity'], cat:'connectivity', unit:'L7', source:'Lecture 7 study guide',
    clues:[
      'Fox and colleagues (2005) reported it at rest between the default network and attention regions, after regressing out the whole-brain average signal.',
      'Murphy and colleagues (2009) showed that global signal regression mathematically guarantees some of these, starting a long debate over which ones are real.',
      'In the lecture\'s critique of psychedelic studies, added noise weakened these between networks, which made the networks look more connected as the values moved toward zero.',
      'A correlation of 0 means two regions are unrelated; this means they are related, but move in opposite directions.',
      'A correlation below zero between two regions\' activity over time: when one goes up, the other goes down.'],
    learn:'A negative correlation between the activity time series of two regions (r between 0 and -1): when one is above its average, the other tends to be below. In resting-state fMRI the default mode network is often anticorrelated with task-positive networks such as the dorsal attention network, although global signal regression can create or exaggerate such negative values (Murphy et al., 2009). Added noise moves every correlation toward zero, so anticorrelations weaken, which can look like increased connectivity. The SAINT depression treatment targets the prefrontal site most anticorrelated with the subgenual cingulate.' },

  { id:'connectivity_matrix', answer:'Connectivity matrix', aliases:['connectivity matrices','correlation matrix','correlation matrices','functional connectivity matrix','FC matrix','adjacency matrix','connectome matrix'], cat:'connectivity', unit:'L7', source:'Lecture 7 (functional connectivity)',
    clues:[
      'Finn and colleagues (2015) showed that one of these, a 268-by-268 table from a single scan session, could pick out which of 126 people it came from.',
      'It is symmetric: for 100 regions it holds 4,950 unique correlations, each shown twice, one on each side of the diagonal.',
      'In the lecture\'s scan, sorting its rows and columns by network made blocks appear: regions in the same network correlated 0.38 on average, regions in different networks 0.12.',
      'A seed map shows one region\'s correlations with the whole brain; this table shows every region\'s correlation with every other region.',
      'A table (often a heat map) of the correlations between every pair of brain regions, with one row and one column per region.'],
    learn:'A square table whose rows and columns are brain regions and whose cells hold the connectivity (usually the correlation of BOLD time series) between each pair. It is symmetric, with N(N-1)/2 unique values. Sorting the regions by network reveals blocks of strong within-network correlation, and thresholding it gives a graph of nodes and edges for network analysis. Individual matrices are distinctive enough to identify people (Finn et al., 2015).' },

  { id:'common_input', answer:'Common input', aliases:['common driver','hidden driver','third variable','third-variable problem','common cause','shared input','common-input problem','third-area problem'], cat:'connectivity', unit:'L7', source:'Lecture 7 (the problem with functional connectivity)',
    clues:[
      'Adachi and colleagues (2012) combined macaque tract-tracing data with fMRI and found that areas with no direct anatomical link were correlated mainly because they received from, and unexpectedly projected to, the same areas.',
      'Partial correlation can expose it: regress the suspected source out of both time series, and their correlation drops toward zero.',
      'In the lecture\'s animation, area C sent its signal to areas A and B: A and B correlated at r = 0.80, and when C\'s connections were cut the correlation fell to 0.00.',
      'Head motion is a source of shared signal from outside the brain; this is a third brain area that drives both regions.',
      'The problem that two brain regions can be correlated without being connected, because a third region drives both of them.'],
    learn:'One reason functional connectivity does not imply a direct connection: if a third region (or any shared source) drives two regions, their activity will be correlated even though neither communicates with the other. This is the third-variable problem of correlation. Correlation also cannot reveal direction (A to B or B to A) or distinguish a direct link from a detour through another area. Testing causation requires intervening, for example by stimulating or inactivating a region.' },

  { id:'head_motion', answer:'Head motion', aliases:['head movement','head movements','motion artifact','motion artifacts','subject motion','in-scanner motion','in-scanner head motion','movement artifact'], cat:'connectivity', unit:'L7', source:'Lecture 7 (the problem with functional connectivity)',
    clues:[
      'Power and colleagues (2012) found that it weakens many long-distance correlations and strengthens short-distance ones, forcing them to revise earlier conclusions about how brain networks develop in childhood.',
      'It is usually summarized as framewise displacement, the shift from one brain image to the next, and images with large values are often discarded ("scrubbing").',
      'In the lecture\'s simulation, six brief jolts made two unconnected areas correlate at r = 0.40, and in one psychedelic study it was about 1.7 times as large on psilocybin as on placebo.',
      'Breathing adds a slow, brain-wide drift through blood CO2; this adds sudden jolts to the signal whenever the person moves.',
      'A source of spurious functional connectivity from outside the brain: the participant moving in the scanner, which can make unconnected regions look correlated.'],
    learn:'Movement of the participant\'s head during scanning. It shifts which tissue each voxel samples and changes the signal across many regions at once, so it can create false correlations (especially between nearby regions) and weaken real long-distance ones (Power et al., 2012; Van Dijk et al., 2012). Groups that move more, such as children, some patient groups and people on psychedelics, can therefore show connectivity differences that are partly artifact. Analyses regress out motion estimates and remove high-motion images.' },

  { id:'physiological_noise', answer:'Physiological noise', aliases:['physiological artifact','physiological artifacts','breathing artifact','respiratory artifact','respiration artifact','respiratory noise','cardiac noise','cardiac and respiratory noise'], cat:'connectivity', unit:'L7', source:'Lecture 7 (the problem with functional connectivity)',
    clues:[
      'Birn and colleagues (2006) showed that natural changes in breathing depth and rate produce BOLD fluctuations in a map that overlaps the default mode network.',
      'Slower or shallower breaths raise carbon dioxide in the blood, which widens blood vessels and lifts the BOLD signal almost everywhere at once; heartbeats add faster pulsations near large vessels.',
      'In the lecture\'s animation, a slow wave of blood CO2 added on top of the head movements brightened the whole brain and raised the correlation from 0.40 to 0.60.',
      'Head motion jolts the signal when the person moves; this comes from the body\'s own rhythms, even when the head is perfectly still.',
      'Fluctuations in the fMRI signal caused by the body\'s rhythms rather than by neural activity, which can create false functional connectivity.'],
    learn:'Changes in the BOLD signal caused by the body rather than by neural activity. Breathing alters blood CO2, which dilates or constricts vessels and shifts the signal across the brain, and the cardiac pulse moves tissue and fluid near large vessels. Because these effects are shared by many regions, they can make regions look functionally connected (Birn et al., 2006). Analyses record breathing and heart rate, or regress out signals from white matter and ventricles.' },

  { id:'network_disintegration', answer:'Network disintegration', aliases:['disintegration','loss of network integrity','reduced network integrity','reduced within-network connectivity','decreased within-network connectivity'], cat:'connectivity', unit:'L7', source:'Lecture 7 (psychedelics)',
    clues:[
      'Girn and colleagues\' 2026 mega-analysis (11 datasets, 5 drugs, 267 people) found it was mostly small, under 0.1 in correlation units, and consistent mainly in visual and somatomotor networks.',
      'Carhart-Harris et al. (2016) found it in all 12 resting-state networks they tested, significantly in 10, with drops of roughly 15 to 35%.',
      'In the lecture\'s LSD study (75 µg, 15 usable scans), a bigger drop in parahippocampal-retrosplenial connectivity went with stronger ego dissolution (r = -0.73).',
      'Desegregation is the between-network change, some pairs of networks moving together more; this is the within-network change, a network\'s own regions moving together less.',
      'The reported psychedelic effect in which regions within the same resting-state network become less correlated with one another.'],
    learn:'A claim from psychedelic fMRI research (Carhart-Harris et al., 2016, LSD): within resting-state networks, the regions\' BOLD signals move together less on the drug. It is paired with "desegregation," in which some pairs of networks become more coupled. Critics note that people move more on psychedelics, and that added noise shrinks within-network correlations and weakens anticorrelations, mimicking the pattern. A 2026 mega-analysis (Girn et al.) found only small, selective drops, consistent mainly in visual and somatomotor networks.' },


  /* ---------------------------- LECTURE 8 ---------------------------- */
  { id:'sensation', answer:'Sensation', aliases:['sensations','sensory transduction','sensing'], cat:'vision', unit:'L8', source:'Lecture 8 (sensation and perception)',
    clues:[
      'Gustav Fechner\'s psychophysics (1860) set out to measure its lawful relation to physical stimulus intensity, building on Weber\'s work on just-noticeable differences.',
      'Its receptors adapt: a steady stimulus, like the pressure of clothing on the skin, soon produces a weaker and weaker signal.',
      'The lecture\'s primrose, photographed as a bee sees it, showed that what we can take in is limited by our receptors: its ultraviolet markings are invisible to humans.',
      'Perception is awareness of the input and its link to stored knowledge; this is the earlier step of translating physical energy into neural codes.',
      'The translation of external information (light, sound, touch, odor) into neural signals by the sense organs.'],
    learn:'The detection of physical energy (light, sound, chemicals, pressure) by sensory receptors and its translation into neural codes. In the lecture\'s definition, sensation is the input stage and perception is the awareness and interpretation of that input, linked to stored knowledge. Sensation constrains perception (we cannot see the ultraviolet patterns that bees see on flowers), but cognitive factors also shape what we perceive.' },

  { id:'perception', answer:'Perception', aliases:['perceptions','perceiving','perceptual experience','percept','percepts'], cat:'vision', unit:'L8', source:'Lecture 8 (sensation and perception)',
    clues:[
      'Helmholtz described it as "unconscious inference": the brain\'s best guess about what in the world caused the pattern on the senses.',
      'Because the same image on the retina could come from many different scenes, it depends on assumptions and context as well as on the input itself.',
      'The lecture\'s example was "the dress": one photo looked blue and black to some people and white and gold to others, depending on their implicit assumptions about the lighting.',
      'Sensation translates physical energy into neural codes; this is the awareness of that input and its link to stored knowledge.',
      'The awareness and interpretation of sensory input, linked to stored knowledge and shaped by expectations and context.'],
    learn:'The awareness and interpretation of sensory input, linking it to stored knowledge. Perception is constrained by sensation but also shaped by cognitive factors such as expectations, context and attention, which is why one stimulus can look different to different people (the blue-and-black or white-and-gold dress, explained by different assumptions about the illumination; Witzel et al., 2017). High-level perception includes recognizing objects, faces, places, motion and color, with specialized regions along the visual hierarchy.' },

  { id:'multimodal_area', answer:'Multimodal association cortex', aliases:['multimodal area','multimodal areas','multimodal cortex','multimodal association area','association cortex','association areas','polymodal cortex','multisensory cortex','multisensory area'], cat:'anatomy', unit:'L8', source:'Lecture 8 (how are sensory systems organized?)',
    clues:[
      'Examples include the superior temporal sulcus, where some neurons respond to faces and to voices and change their firing when the two are paired, and parts of the intraparietal and prefrontal cortex.',
      'It fills much of the cortex between the sensory areas, in the parietal, temporal and frontal lobes, and its neurons can fire more to a sight plus a sound than to either alone.',
      'On the lecture\'s map of how sensory systems are organized, it was the stage beyond the primary and secondary (higher) sensory areas: regions that receive input from several senses.',
      'Primary and secondary sensory areas each handle one sense; this cortex combines information from several.',
      'Cortex that receives and integrates input from more than one sensory modality.'],
    learn:'Regions of cortex that receive input from more than one sensory modality and integrate it. They lie beyond the primary sensory areas (the first cortical stage for each sense) and the secondary or higher sensory areas (still mostly one sense). Examples include parts of the superior temporal sulcus, posterior parietal cortex and prefrontal cortex. Their neurons can respond more strongly to combined inputs, such as a face and a voice, than to either alone.' },

  { id:'retina', answer:'Retina', aliases:['retinas','retinae','retinal','neural retina'], cat:'anatomy', unit:'L8', source:'Lecture 8 study guide',
    clues:[
      'Ramón y Cajal\'s drawings of its stacked layers of cells, in animals from fish to mammals, helped him argue that signals flow through neurons in one direction.',
      'Its output neurons, the ganglion cells, send their axons out through the optic disc, creating the blind spot; about a million of them form each optic nerve.',
      'In the lecture it was the first stage of the ascending visual pathway, sending input to the LGN and also directly to the superior colliculus for the visuomotor system.',
      'The LGN is the thalamic relay for vision; this is the sheet of tissue at the back of the eye where light is first turned into neural signals.',
      'The layer of light-sensitive tissue lining the back of the eye, containing the photoreceptors (rods and cones) and the neurons that send visual signals to the brain.'],
    learn:'The light-sensitive layer at the back of the eye, actually part of the central nervous system. Photoreceptors (rods and cones) transduce light; bipolar and ganglion cells process it, and ganglion cell axons form the optic nerve. Each retina sees both visual hemifields: its nasal half receives light from the same-side field and its temporal half from the opposite field. Its main targets are the LGN of the thalamus (on the way to V1) and the superior colliculus.' },

  { id:'lgn', answer:'Lateral geniculate nucleus', aliases:['LGN','lateral geniculate','lateral geniculate body','lateral geniculate nuclei','dorsal lateral geniculate nucleus','dLGN'], cat:'anatomy', unit:'L8', source:'Lecture 8 study guide',
    clues:[
      'Its name means "knee-shaped," for its bend; in primates its layers divide into magnocellular layers 1 and 2, carrying motion and coarse form, and parvocellular layers 3 to 6, carrying color and fine detail.',
      'Each of its layers receives input from only one eye, and each one (left or right) represents only the opposite half of the visual field.',
      'In the lecture its layers alternated between the eyes: the opposite eye feeds layers 1, 4 and 6, and the same-side eye layers 2, 3 and 5.',
      'The superior colliculus receives retinal input for guiding eye movements; this thalamic nucleus relays retinal input to primary visual cortex.',
      'The visual relay nucleus of the thalamus, between the retina and primary visual cortex.'],
    learn:'The thalamic nucleus that relays visual signals from the retina to primary visual cortex (V1), forming the retino-geniculo-striate pathway. Each LGN represents the contralateral visual hemifield. It has six layers, each receiving input from one eye (contralateral eye: layers 1, 4 and 6; ipsilateral eye: 2, 3 and 5); layers 1 and 2 are magnocellular and 3 to 6 parvocellular. Its neurons have center-surround receptive fields like those of retinal ganglion cells, and it receives strong feedback from cortex.' },

  { id:'thalamus', answer:'Thalamus', aliases:['thalami','thalamic','thalamic nuclei','thalamic relay','dorsal thalamus'], cat:'anatomy', unit:'L8', source:'Lecture 8 study guide', lab:'MRI_Explorer.html',
    clues:[
      'To stop the shaking of essential tremor, surgeons destroy a tiny spot in it (the ventral intermediate nucleus), today often with focused ultrasound instead of an incision.',
      'Most senses have their own relay nucleus here: the lateral geniculate for vision, the medial geniculate for hearing, and the ventral posterior nuclei for touch.',
      'The lecture called it the gateway to the cortex: every sensory input reaches cortex through it except smell.',
      'The LGN is one of its nuclei, dedicated to vision; this is the whole paired structure that relays nearly all sensory input to cortex.',
      'The paired structure at the center of the brain that relays sensory signals (all except olfaction) to the cortex.'],
    learn:'A paired gray-matter structure above the brainstem, made of many nuclei, that relays and regulates information reaching the cortex. Every sensory system except olfaction passes through a thalamic relay nucleus on its way to cortex (vision: LGN; hearing: medial geniculate nucleus; touch: ventral posterior nuclei). It also takes part in motor loops, attention and arousal, and receives massive feedback from cortex. Destroying a small part of it (thalamotomy) relieves tremor.' },

  { id:'superior_colliculus', answer:'Superior colliculus', aliases:['superior colliculi','SC','optic tectum','tectum'], cat:'anatomy', unit:'L8', source:'Lecture 8 (thalamus: gateway to the cortex)',
    clues:[
      'In blindsight, where patients with V1 damage can point to objects they say they cannot see, its pathway from the retina is one of the routes thought to carry the information.',
      'Its layers hold a map of visual space aligned with maps of sound and touch, and stimulating a point in it moves the eyes toward the matching location.',
      'In the lecture it was the example of retinal input that bypasses the thalamus: the retina projects to it directly, for the visuomotor system.',
      'The LGN relays visual input to cortex for seeing; this midbrain structure uses visual input to orient the eyes and head.',
      'The midbrain structure that receives direct input from the retina and controls eye movements toward visual targets.'],
    learn:'A layered structure on the roof of the midbrain (tectum). It receives direct input from the retina and from cortex, contains aligned maps of visual, auditory and body space, and drives orienting movements of the eyes and head, such as saccades. In the lecture it was the example of a sensory pathway that reaches a subcortical target directly rather than through the thalamus to cortex.' },

  { id:'retinogeniculostriate', answer:'Retino-geniculo-striate pathway', aliases:['retinogeniculostriate pathway','retino-geniculo-striate','geniculostriate pathway','geniculostriate','retinogeniculate pathway','retinogeniculocortical pathway','primary visual pathway','ascending visual pathway'], cat:'vision', unit:'L8', source:'Lecture 8 study guide',
    clues:[
      'Damage anywhere along it after the optic chiasm causes loss on the same side of the visual field in both eyes (a homonymous defect), a pattern neurologists use to locate the lesion.',
      'About 90% of the optic nerve\'s fibers take this route; the rest go to targets such as the superior colliculus.',
      'In the lecture it was the main route from the eye to cortex, with one relay in the thalamus before the first cortical stage.',
      'The route from the retina to the superior colliculus serves eye movements; this route through the thalamus serves conscious seeing.',
      'The main visual pathway from the eye, through the thalamic relay, to primary visual cortex.'],
    learn:'The main ascending visual pathway. Retinal ganglion cells send axons through the optic nerve, the optic chiasm (where fibers from the nasal half of each retina cross) and the optic tract to the lateral geniculate nucleus (LGN) of the thalamus, whose axons travel in the optic radiations to striate cortex (V1). As a result each hemisphere receives the opposite visual hemifield from both eyes.' },

  { id:'v1', answer:'Primary visual cortex', aliases:['V1','striate cortex','BA17','primary visual area','calcarine cortex','area V1','visual area V1'], cat:'anatomy', unit:'L8', source:'Lecture 8 (retinotopy in primary visual cortex)', lab:'Cortex_Explorer.html',
    clues:[
      'Its other name comes from a stripe of myelinated fibers visible to the naked eye in cut tissue, noticed by the medical student Francesco Gennari in 1776.',
      'It lies on the inner surface of the occipital lobe, wrapped around a deep horizontal fold, with the upper visual field below the fold and the lower field above it.',
      'Tootell and colleagues (1982) injected a monkey with radioactive deoxyglucose while it viewed a target pattern, then "developed" this area like a photograph and found the pattern laid out on it.',
      'Extrastriate areas lie beyond it and specialize in features like color and motion; this area is the first cortical stage, receiving its input from the LGN.',
      'The first cortical stage of visual processing, in the occipital lobe, which receives input from the LGN and holds a retinotopic map of the opposite visual field.'],
    learn:'The first cortical area for vision (Brodmann area 17, striate cortex), along the calcarine sulcus in the occipital lobe. It receives input from the LGN, contains a precise retinotopic map of the contralateral visual hemifield with a magnified fovea, and has neurons tuned to orientation, spatial frequency, color, binocular disparity and direction of motion (simple and complex cells). Its output goes to extrastriate areas along the dorsal and ventral streams. Damage causes blindness in the corresponding part of the visual field.' },

  { id:'extrastriate', answer:'Extrastriate cortex', aliases:['extrastriate','extrastriate visual cortex','extrastriate areas','extrastriate visual areas','prestriate cortex','visual association cortex','higher visual areas'], cat:'anatomy', unit:'L8', source:'Lecture 8 (multiple visual areas in extrastriate cortex)',
    clues:[
      'Felleman and Van Essen\'s classic 1991 diagram arranged its areas in the monkey into a hierarchy many levels deep, linked by hundreds of connections.',
      'Many of its areas hold their own map of the visual field, with receptive fields that grow larger and maps that grow coarser at each step up from V1.',
      'The lecture\'s flat map of a macaque\'s right hemisphere showed about 32 visual areas, spread across the occipital, parietal, temporal and even frontal lobes.',
      'Striate cortex (V1) is the first cortical stage for vision; this term covers the visual areas beyond it, such as V2, V3, V4 and MT.',
      'The visual areas outside primary visual cortex, including V2, V3, V4 and MT.'],
    learn:'All the visual cortical areas beyond primary visual cortex (striate cortex, V1): V2, V3, V4, MT and many more, about 30 in the macaque, extending into parietal and temporal cortex. They form a hierarchy along the dorsal and ventral streams, with larger receptive fields and coarser, less retinotopic maps at higher levels, and some specialize in particular features such as color (V4) or motion (MT).' },

  { id:'retinotopy', answer:'Retinotopy', aliases:['retinotopic map','retinotopic maps','retinotopic mapping','retinotopic organization','retinotopic','visuotopy','visuotopic map','visual field map','visual field maps'], cat:'vision', unit:'L8', source:'Lecture 8 (retinotopic mapping)',
    clues:[
      'Tatsuji Inouye (1909) and Gordon Holmes (1918) made the first accurate charts of it in humans, from the blind regions of soldiers with bullet wounds to the occipital lobe.',
      'Mapping it with fMRI uses a slowly moving stimulus, such as a rotating wedge, an expanding ring or a drifting bar, so that the time each voxel responds reveals the part of the visual field it represents.',
      'In the lecture, recordings from neighboring sites in visual cortex found neighboring receptive fields, and fMRI with a moving bar revealed several such maps side by side: V1, V2 and V3.',
      'Topographic organization is the general principle of orderly maps (somatotopy, tonotopy); this is the version for vision.',
      'The orderly mapping of the visual field onto visual cortex, so that neighboring points in the visual field are represented by neighboring neurons.'],
    learn:'The orderly mapping of the visual field (and thus the retina) onto a visual structure, so that neighboring locations in space are represented by neighboring neurons. V1, V2, V3 and many higher areas each contain a map of the contralateral visual field; maps in neighboring areas are mirror images, and the reversals mark the borders between areas. It is measured in animals with recordings or deoxyglucose (Tootell et al., 1982) and in humans with fMRI using moving bars, wedges and rings (population receptive field mapping). Maps become coarser in higher areas.' },

  { id:'foveal_magnification', answer:'Foveal magnification', aliases:['cortical magnification','cortical magnification factor','magnification factor','foveal magnification factor','foveal overrepresentation','foveal over-representation'], cat:'vision', unit:'L8', source:'Lecture 8 study guide',
    clues:[
      'Daniel and Whitteridge (1961) first quantified it in monkey V1 as the millimeters of cortex devoted to each degree of visual angle.',
      'It follows roughly an inverse relation with distance from the center of gaze: moving twice as far out roughly halves the amount of cortex per degree.',
      'In the lecture\'s pRF clips, the central 4 degrees of vision filled about as much of V1 as everything from 4 to 8 degrees.',
      'Receptive fields grow toward the periphery; this is the complementary fact that the center of gaze gets far more cortex per degree of visual field.',
      'The over-representation of the center of gaze in visual cortex: much more cortex per degree of visual field at the center than in the periphery.'],
    learn:'The disproportionate amount of visual cortex devoted to the center of gaze (the fovea). In V1 the cortical magnification factor (millimeters of cortex per degree of visual field) is highest at the fovea and falls with eccentricity, so the central few degrees occupy a large fraction of V1. It parallels the dense packing of cones and ganglion cells in the fovea and the small receptive fields there, and it is why vision is sharpest where we look.' },

  { id:'prf', answer:'Population receptive field', aliases:['pRF','pRFs','population receptive fields','pRF mapping','population receptive field mapping','population receptive field model','pRF model'], cat:'vision', unit:'L8', source:'Lecture 8 (mapping visual areas in humans with fMRI)',
    clues:[
      'Kay and colleagues (2013) added a compressive exponent to its model, because a voxel\'s response grows less than linearly as the stimulus covers more of its field.',
      'Dumoulin and Wandell\'s 2008 model predicts a voxel\'s time series from where the stimulus was at every moment, delayed and smoothed by the hemodynamic response, and searches thousands of positions and sizes for the best match.',
      'In the lecture\'s clips a checkerboard bar swept the screen in eight directions, and each voxel\'s estimate grew larger with distance from the center of gaze and from V1 to V2 to V3.',
      'A single neuron responds to its own small patch of space; this is the combined patch covered by the hundreds of thousands of neurons in one fMRI voxel.',
      'The region of the visual field that drives the neurons within one fMRI voxel, estimated by fitting a model to responses to a moving bar.'],
    learn:'The region of the visual field that drives the population of neurons in one fMRI voxel. Dumoulin and Wandell (2008) model it as a 2-D Gaussian with a center and a size, and estimate it by finding the Gaussian whose predicted response (the stimulus overlap, delayed and smoothed by the hemodynamic response) best matches the voxel\'s measured time series during a moving-bar experiment. Mapping every voxel\'s pRF center gives polar angle and eccentricity maps, and its size shows how receptive fields grow with eccentricity and up the visual hierarchy.' },

  { id:'polar_angle', answer:'Polar angle', aliases:['polar angle map','polar angle maps','polar angle mapping','polar angle reversal','polar angle reversals','angle map','phase reversal','meridian reversal'], cat:'vision', unit:'L8', source:'Lecture 8 study guide',
    clues:[
      'Sereno and colleagues (1995) mapped it with a slowly rotating, flickering checkerboard and computed "visual field sign" to draw the borders of several human visual areas for the first time.',
      'Its full range is 360 degrees around fixation, and the maps in each hemisphere cover only the 180 degrees on the opposite side.',
      'In the lecture\'s flattened maps, the colors coding it ran in bands that reversed direction, and each reversal marked a border between V1, V2 and V3.',
      'Eccentricity is distance from the center of gaze; this is the direction around it, like the hands of a clock.',
      'The direction of a location in the visual field around the center of gaze; reversals in its cortical map mark the borders between visual areas.'],
    learn:'One of the two coordinates of a retinotopic map: the angle of a location around the fixation point (eccentricity, the distance from fixation, is the other). In fMRI it is mapped with a rotating wedge or a pRF model. On the cortical surface the representation of polar angle reverses at the vertical and horizontal meridians, so neighboring visual areas are mirror images, and the reversals are used to draw the borders between V1, V2 and V3 (Sereno et al., 1995).' },

  { id:'dorsal_stream', answer:'Dorsal stream', aliases:['dorsal pathway','dorsal visual stream','dorsal visual pathway','where pathway','how pathway','where/how pathway','where stream','how stream','occipitoparietal pathway','parietal pathway'], cat:'vision', unit:'L8', source:'Lecture 8 study guide',
    clues:[
      'Ungerleider and Mishkin (1982) defined it in monkeys: lesions of posterior parietal cortex impaired a landmark task (choosing the cover nearer a marker) but not object discrimination.',
      'Neurons along it in posterior parietal cortex fire as an animal prepares to reach, grasp or move its eyes, coding locations relative to the eyes, head or hand.',
      'In the lecture it carried spatial perception, motion and vision for action from occipital cortex up into the parietal lobe; damage to it causes optic ataxia.',
      'The ventral stream into the temporal lobe identifies what an object is; this stream into the parietal lobe works out where it is and how to act on it.',
      'The visual pathway from occipital to parietal cortex specialized for spatial location, motion and guiding actions.'],
    learn:'The visual pathway running from V1 through occipital cortex into the posterior parietal lobe: the "where" pathway (Ungerleider and Mishkin) or "how" pathway (Goodale and Milner). It processes spatial location, motion (including area MT) and the visual guidance of actions such as reaching and grasping. Damage produces deficits such as optic ataxia, Bálint\'s syndrome and akinetopsia, while object recognition can be spared. Receptive fields grow and retinotopy weakens along it.' },

  { id:'ventral_stream', answer:'Ventral stream', aliases:['ventral pathway','ventral visual stream','ventral visual pathway','what pathway','what stream','what system','occipitotemporal pathway','temporal pathway'], cat:'vision', unit:'L8', source:'Lecture 8 study guide',
    clues:[
      'In Ungerleider and Mishkin\'s monkeys, lesions of inferior temporal cortex impaired learning which of two objects hid a reward, but spared the landmark task.',
      'Its neurons grow more selective and more tolerant at each step, ending in inferotemporal cells that respond to a face or object across changes in position, size and viewpoint.',
      'In the lecture it carried shape, color, texture, object recognition and categorization, with links to memory, into the temporal lobe; damage to it causes visual agnosia.',
      'The dorsal stream into the parietal lobe handles where things are and how to act on them; this stream into the temporal lobe identifies what they are.',
      'The visual pathway from occipital to inferior temporal cortex specialized for recognizing objects, faces, colors and shapes.'],
    learn:'The visual pathway running from V1 through V2, V4 and lateral occipital cortex into the inferior temporal lobe: the "what" pathway. It supports recognition of shape, color, texture, objects, faces and places, with links to memory, and contains category-selective regions such as the FFA and PPA. Receptive fields grow and selectivity becomes more abstract along it. Damage causes visual agnosia, prosopagnosia or achromatopsia, while visually guided action can be spared.' },

  { id:'mt', answer:'Area MT', aliases:['MT','V5','MT+','hMT+','hMT','MT/V5','V5/MT','area V5','visual area V5','middle temporal area','visual area MT','middle temporal visual area','MT complex'], cat:'anatomy', unit:'L8', source:'Lecture 8 study guide',
    clues:[
      'Dubner and Zeki (1971) found that most of its neurons in the macaque prefer one direction of motion, in a patch on the back bank of the superior temporal sulcus.',
      'Its neurons are tuned to the direction and speed of motion, are largely indifferent to color, and respond strongly even at very low contrast.',
      'In the lecture\'s localizer, voxels that responded more to moving dots than to the same dots standing still clustered in it, on the lateral surface near the junction of the occipital and temporal lobes.',
      'V4 in the ventral stream prefers color; this area in the dorsal stream prefers motion.',
      'The extrastriate visual area specialized for motion, whose damage causes akinetopsia.'],
    learn:'An extrastriate visual area (also called V5; in humans hMT+ or the MT complex) on the lateral occipito-temporal surface, part of the dorsal stream. Nearly all of its neurons are selective for the direction and speed of motion. In fMRI it responds more to moving than to stationary stimuli (the motion localizer). Bilateral damage causes akinetopsia (motion blindness), and microstimulating its direction-tuned neurons biases monkeys\' motion judgments (Salzman, Britten and Newsome, 1990), so its activity is needed for normal motion perception and can drive it.' },

  { id:'functional_localizer', answer:'Functional localizer', aliases:['localizer','localizers','localiser','functional localiser','functional localizers','localizer scan','localizer task','localizer experiment'], cat:'decoding', unit:'L8', source:'Lecture 8 (functional specialization in human visual cortex)',
    clues:[
      'Saxe, Brett and Kanwisher (2006) defended the practice against critics, arguing that defining a region separately in each person beats averaging anatomy across people whose specialized areas lie in different places.',
      'It is run as separate scans so that the voxels chosen with it are independent of the data later used to test hypotheses, which avoids "double dipping."',
      'The lecture showed two: color versus grayscale Mondrians to find V4, and moving versus stationary dots to find MT, alternating in 16-second blocks.',
      'A region of interest is the set of voxels you analyze; this is the separate experiment you run to define it in each person.',
      'A short, simple fMRI experiment used to find a region defined by its responses (such as the FFA, V4 or MT) in each participant before the main experiment.'],
    learn:'A simple fMRI contrast run to identify a functional region in each participant: faces vs objects for the FFA, color vs grayscale for V4, moving vs static dots for MT, or a moving bar for retinotopic areas. The voxels it identifies become a region of interest for testing hypotheses with independent data from the main experiment. This avoids circular analysis and allows for differences in where functional areas lie in different brains.' },

  { id:'akinetopsia', answer:'Akinetopsia', aliases:['motion blindness','cerebral akinetopsia','visual motion blindness'], cat:'lesion', unit:'L8', source:'Lecture 8 study guide',
    clues:[
      'Zihl, von Cramon and Mai described the classic case in 1983: patient L.M., who after damage to both sides of the brain had trouble pouring tea because the liquid looked frozen, like a glacier.',
      'Patients see the world as a series of still snapshots, with objects seeming to jump from one place to another, while color, form and acuity can be normal.',
      'In the lecture it followed bilateral V5 lesions, and "motion" became something the patient had to infer from changes in position.',
      'Achromatopsia is the loss of color perception after V4 damage; this is the loss of motion perception after damage to MT.',
      'The loss of motion perception caused by damage to visual area MT/V5.'],
    learn:'Impaired perception of visual motion caused by cortical damage, classically bilateral lesions of area MT/V5 near the occipito-temporal junction. Patient L.M. (Zihl et al., 1983) saw moving things as a series of static positions: pouring tea looked like a frozen arc, and cars seemed to jump from place to place. Other visual functions such as color and form can be spared, a dissociation that supports MT\'s specialization for motion.' },

  { id:'achromatopsia', answer:'Achromatopsia', aliases:['cerebral achromatopsia','cortical achromatopsia','central achromatopsia','cortical color blindness','cortical colour blindness','hemiachromatopsia'], cat:'lesion', unit:'L8', source:'Lecture 8 study guide',
    clues:[
      'Oliver Sacks described a painter, "Mr. I.," who after a car accident found food so lifeless that he turned to black olives, white rice, black coffee and yogurt.',
      'It follows damage to the lingual and fusiform gyri on the underside of the occipital lobe; damage on one side takes the color out of only the opposite half of the visual field.',
      'In the lecture, a left V4 lesion drained the color from the right half of the visual field, and drawings by such patients showed that knowledge of shape is spared.',
      'Ordinary color blindness comes from missing or faulty cone pigments in the eye; this loss of color comes from damage to the cortex.',
      'Impaired color perception caused by cortical damage (often to V4), so that the world looks gray.'],
    learn:'Loss of color perception caused by damage to visual cortex, typically the ventral occipito-temporal region including area V4 (lingual and fusiform gyri). The world appears in shades of gray, while form and motion perception can be intact. A one-sided lesion causes hemiachromatopsia, loss of color in the opposite visual hemifield. It differs from common inherited color blindness (missing or altered cone pigments) and from congenital achromatopsia, a rare inherited retinal disorder in which the cones do not work.' },

  { id:'ffa', answer:'Fusiform face area', aliases:['FFA','fusiform face region','face area','face-selective cortex','mFus-faces','pFus-faces'], cat:'anatomy', unit:'L8', source:'Lecture 8 study guide', lab:'Cortex_Explorer.html',
    clues:[
      'Kanwisher, McDermott and Chun named it in 1997, after finding a region, usually in the right hemisphere, that responded more to one category of picture than to objects, houses or scrambled versions.',
      'Its response is at least twice as strong to its preferred category as to other objects, drops somewhat when the pictures are turned upside down, and in most people is larger on the right.',
      'In the lecture, electrically stimulating it made a patient\'s view of his doctor "metamorphose," while objects and written words stayed the same (Parvizi et al., 2012).',
      'The parahippocampal place area responds most to scenes and buildings; this region, lateral to it on the underside of the temporal lobe, responds most to faces.',
      'The region of ventral temporal cortex that responds more to faces than to other objects, known by three letters.'],
    learn:'A region on the lateral fusiform gyrus of the ventral temporal lobe, usually larger in the right hemisphere, that responds more strongly to faces than to other objects (Kanwisher, McDermott and Chun, 1997). It is identified in each person with a localizer (faces vs objects or houses). Damage near it is associated with prosopagnosia, and electrically stimulating it distorts perceived faces (Parvizi et al., 2012), evidence that it plays a causal role in face perception.' },

  { id:'ppa', answer:'Parahippocampal place area', aliases:['PPA','parahippocampal place region','place area','scene-selective cortex','place-selective cortex'], cat:'anatomy', unit:'L8', source:'Lecture 8 (faces and place: fMRI)', lab:'Cortex_Explorer.html',
    clues:[
      'Epstein and Kanwisher (1998) found that it responded strongly even to pictures of empty rooms with no objects in them, but hardly at all to faces.',
      'It responds to the layout of a scene, the shape of the surrounding space, more than to the objects in it, and is engaged when people recognize landmarks and find their way.',
      'On the lecture\'s fMRI slide it lay just medial to the face-selective fusiform region and preferred pictures of buildings and landscapes.',
      'The fusiform face area prefers faces; this region on the medial underside of the temporal lobe prefers scenes and places.',
      'The region of ventral temporal cortex that responds more to scenes and places than to faces or objects.'],
    learn:'A region of the posterior parahippocampal gyrus and nearby collateral sulcus that responds more to scenes and places (rooms, buildings, landscapes) than to faces or objects (Epstein and Kanwisher, 1998). It represents the spatial layout of the environment and is involved in recognizing places and in navigation. It lies medial to the fusiform face area in ventral temporal cortex.' },

  { id:'prosopagnosia', answer:'Prosopagnosia', aliases:['face blindness','face-blindness','acquired prosopagnosia','face agnosia','facial agnosia'], cat:'lesion', unit:'L8', source:'Lecture 8 (prosopagnosia and the FFA)',
    clues:[
      'Joachim Bodamer coined its name in 1947 from two Greek roots, after examining soldiers with brain wounds from World War II.',
      'A developmental form with no brain injury affects roughly 2% of people, many of whom do not realize it until adulthood.',
      'In the lecture, patients with bilateral fusiform lesions could not recognize people by their faces but could the moment they spoke, and a farmer could no longer recognize his cows.',
      'Visual agnosia impairs recognizing objects in general; this impairs recognizing faces in particular, while voices and objects can still be recognized.',
      'The inability to recognize familiar faces, despite normal vision and intact recognition of people by their voices.'],
    learn:'An impairment in recognizing faces, including familiar ones and sometimes one\'s own, despite intact vision, intellect and object recognition. People can still be recognized by voice, gait or clothing. Acquired prosopagnosia follows damage to ventral occipito-temporal cortex, often bilateral fusiform lesions near the FFA; a developmental form occurs without brain injury. Cases such as the farmer who also could not recognize his cows (Assal et al., 1984) raise the question of whether the deficit is truly specific to faces.' },

  { id:'visual_agnosia', answer:'Visual agnosia', aliases:['agnosia','agnosias','visual agnosias','visual object agnosia','object agnosia'], cat:'lesion', unit:'L8', source:'Lecture 8 study guide',
    clues:[
      'Sigmund Freud coined its general name in his 1891 book on aphasia; years earlier, Hermann Munk had described "mind blindness" in dogs with occipital lesions.',
      'The patient can see the object and describe its parts, and can often name it as soon as they touch it or hear it, so the problem is neither blindness nor a naming deficit.',
      'In the lecture it followed ventral stream lesions and impaired object recognition while sparing visually guided action, the mirror image of optic ataxia.',
      'Prosopagnosia is a recognition failure limited to faces; this is a failure to recognize objects in general by sight.',
      'An impairment in recognizing objects by sight that is not explained by problems in elementary vision, language or memory.'],
    learn:'A failure to recognize objects by sight despite adequate elementary vision (acuity, color, motion), language and general intellect; the same object can often be identified by touch or sound. It follows damage to the ventral visual stream (occipito-temporal cortex), usually on both sides. Lissauer (1890) divided it into apperceptive agnosia (the patient cannot form a coherent percept, and so cannot copy or match shapes) and associative agnosia (the patient can perceive and copy but cannot attach meaning).' },

  { id:'associative_agnosia', answer:'Associative agnosia', aliases:['associative visual agnosia','associative object agnosia'], cat:'lesion', unit:'L8', source:'Lecture 8 study guide',
    clues:[
      'Lissauer (1890) described it as the failure of recognition\'s second stage, and Teuber later called it a normal percept "stripped of its meaning."',
      'Patients\' copies are accurate but slow and slavish, line by line, and the damage usually lies on the underside of the occipito-temporal cortex, often on both sides.',
      'In the lecture\'s definition, the patient sees the object well enough to draw it but cannot identify it.',
      'In apperceptive agnosia the patient cannot form a coherent percept, so cannot copy a shape; in this type the percept is formed but cannot be linked to its meaning.',
      'A visual agnosia in which a patient can perceive and copy an object but cannot recognize it.'],
    learn:'A form of visual agnosia in which perception is relatively intact (the patient can copy a drawing or match identical objects) but the percept cannot be linked to stored knowledge about what the object is or does. The patient may draw an object accurately yet be unable to name it, while recognizing it by touch. It is associated with occipito-temporal damage, often on both sides or in the left hemisphere. Contrast with apperceptive agnosia, a failure at the perceptual stage.' },

  { id:'apperceptive_agnosia', answer:'Apperceptive agnosia', aliases:['apperceptive visual agnosia','visual form agnosia','form agnosia'], cat:'lesion', unit:'L8', source:'Lecture 8 study guide',
    clues:[
      'Patient D.F., who developed it after carbon monoxide poisoning, could not report the orientation of a slot yet could smoothly post a card through it (Goodale and Milner).',
      'Patients fail even simple shape tests, such as copying a drawing, matching two shapes or telling a square from a rectangle, despite normal acuity and color vision.',
      'In the lecture\'s definition it is a profound impairment of visual perception: the patient cannot tell an X from an O.',
      'In associative agnosia the patient can copy an object but not name it; in this type the patient cannot even form a coherent percept to copy.',
      'A visual agnosia in which basic visual features are seen but cannot be put together into the perception of a whole shape or object.'],
    learn:'A form of visual agnosia in which the patient cannot integrate elementary visual features into a coherent shape or object, even though acuity, brightness and color perception may be normal. Patients cannot copy drawings, match shapes or distinguish simple forms (an X from an O). It often follows diffuse damage to occipital cortex, as from carbon monoxide poisoning (patient D.F., whose visually guided actions were nonetheless accurate). Contrast with associative agnosia, in which the percept is formed but cannot be linked to meaning.' },

  { id:'optic_ataxia', answer:'Optic ataxia', aliases:['visuomotor ataxia','misreaching','visual ataxia'], cat:'lesion', unit:'L8', source:'Lecture 8 (patient dissociations in support of two-stream hypothesis)',
    clues:[
      'Bálint coined its name in 1909 for a patient whose right hand went astray under visual guidance, yet touched named parts of his own body accurately.',
      'Patients reach to the wrong place and fail to shape the hand to an object\'s size and orientation, usually worse in peripheral vision than at the point of gaze.',
      'In the lecture it followed dorsal stream lesions: visually guided reaching was impaired even though the patient recognized the objects, a loss of vision for action.',
      'Visual agnosia impairs recognizing objects while sparing reaching for them; this impairs reaching for objects while sparing recognizing them.',
      'The inability to reach accurately for objects under visual guidance, despite normal strength and object recognition, after posterior parietal damage.'],
    learn:'A deficit in visually guided reaching and grasping after damage to posterior parietal cortex (the dorsal stream), despite normal strength, coordination and object recognition. Patients misreach for objects, especially in peripheral vision, and fail to shape the hand appropriately. It is part of Bálint\'s syndrome. The name combines a- (without) and taxis (orderly movement). Its double dissociation with visual agnosia supports the two-streams hypothesis.' },

  { id:'balint', answer:'Bálint\'s syndrome', aliases:['Balint syndrome','Balint-Holmes syndrome','Balints','Balint'], cat:'lesion', unit:'L8', source:'Lecture 8 (Bálint\'s syndrome)',
    clues:[
      'A Hungarian neurologist described it in 1909, and Gordon Holmes later reported similar cases among World War I soldiers with bullet wounds to both sides of the back of the brain.',
      'Its three parts are a fixed, "sticky" gaze (ocular apraxia), inaccurate reaching under visual guidance, and seeing only one object at a time.',
      'In the lecture it followed bilateral parieto-occipital damage, and the patient video showed misreaching, impaired depth perception and simultanagnosia.',
      'Optic ataxia alone is misreaching; this syndrome combines misreaching with an inability to see more than one object at a time and to shift gaze at will.',
      'The syndrome after bilateral parieto-occipital damage that combines simultanagnosia, optic ataxia and difficulty moving the eyes to a new target.'],
    learn:'A syndrome caused by bilateral damage to parieto-occipital (dorsal stream) cortex, described by Rezső Bálint (1909). It has three components: simultanagnosia (perceiving only one object at a time), optic ataxia (misreaching under visual guidance) and ocular apraxia (difficulty voluntarily shifting gaze to a new target). Patients may also misjudge depth and distance, while single objects can still be recognized.' },

  { id:'simultanagnosia', answer:'Simultanagnosia', aliases:['simultagnosia','simultaneous agnosia','dorsal simultanagnosia'], cat:'lesion', unit:'L8', source:'Lecture 8 (Bálint\'s syndrome)',
    clues:[
      'Wolpert named it in 1924 for a patient who could describe the details of a picture but not what the whole scene was about.',
      'Shown a large letter made of small letters, patients often name only the small ones, and they can fail Ishihara color plates while still naming the colors.',
      'In the lecture it was the last part of the patient video on bilateral parieto-occipital damage, after the clips on depth perception and misreaching.',
      'Visual agnosia is failing to recognize an object even when it is seen alone; in this condition each single object is recognized, but several cannot be seen together.',
      'The inability to perceive more than one object at a time, one of the three parts of Bálint\'s syndrome.'],
    learn:'The inability to perceive more than one object (or part of a scene) at a time, even though each object can be recognized when seen alone. Patients cannot grasp the overall meaning of a complex scene and may see only the local elements of a figure. The dorsal form is a component of Bálint\'s syndrome, after bilateral parieto-occipital damage, and is thought to reflect a severe limit on spatial attention.' },


  /* ---------------------------- LECTURE 9 ---------------------------- */
  { id:'necessity', answer:'Necessity', aliases:['necessary','necessary condition','test of necessity','necessity test','causal necessity'], cat:'methods', unit:'L9', source:'Lecture 9 study guide',
    clues:[
      'Broca\'s 1861 patient Leborgne, who lost fluent speech after left frontal damage, was the classic evidence of this kind for speech; in genetics the matching test is a knockout.',
      'It can be shown only by removing or disrupting something: a lesion, an inactivating drug, an optogenetic silencer or a TMS pulse.',
      'In the lecture, prosopagnosia after damage near the FFA was the evidence of this kind for faces: without the region, face recognition fails.',
      'Sufficiency is shown by driving a region and producing the function; this is shown by disrupting a region and watching the function fail.',
      'The property of being required for a function: if the region is disrupted, the function fails.'],
    learn:'A brain region is necessary for a function if the function fails when the region is damaged or disrupted. It is tested by removing or silencing the region: lesions in patients, inactivation in animals (drugs, optogenetic silencing) or virtual lesions with TMS. Correlational methods such as fMRI and EEG cannot establish it. Necessity and sufficiency together amount to causal determination, and stimulation methods can test both.' },

  { id:'sufficiency', answer:'Sufficiency', aliases:['sufficient','sufficient condition','test of sufficiency','sufficiency test','causal sufficiency'], cat:'methods', unit:'L9', source:'Lecture 9 study guide',
    clues:[
      'In genetics, a gene passes this test if switching it on by itself produces a whole program, as when the eyeless gene, turned on in a fly\'s legs, grew eyes there (Halder, Callaerts and Gehring, 1995).',
      'It is shown by driving activity, for example with microstimulation or optogenetic activation, but because stimulation spreads along connections it never shows that one region acts alone.',
      'In the lecture, stimulating the FFA made faces look distorted and stimulating MT shifted monkeys\' motion judgments: evidence of this kind.',
      'Necessity is shown by disrupting a region and watching a function fail; this is shown by activating a region and watching the function appear.',
      'The property of being enough to produce a function: activating the region produces (part of) the function or experience.'],
    learn:'A brain region\'s activity is sufficient for a function or experience if activating it produces that function, as when electrical stimulation of the FFA distorts faces, microstimulation of MT biases motion perception, or optogenetic reactivation of engram cells triggers a fear memory. Because stimulation spreads to neighboring and connected areas, sufficiency usually means that activity starting in the region is enough. Contrast with necessity, which is tested by disruption.' },

  { id:'fritsch_hitzig', answer:'Fritsch and Hitzig', aliases:['Fritsch & Hitzig','Gustav Fritsch','Eduard Hitzig','Fritsch','Hitzig','Gustav Fritsch and Eduard Hitzig'], cat:'history', unit:'L9', source:'Lecture 9 (a short history of brain stimulation)',
    clues:[
      'Their experiments were reportedly done on a dressing table in one of their homes in Berlin, because no suitable university laboratory was available.',
      'Their 1870 paper showed that weak current applied to particular spots of the exposed cortex moved particular muscles on the opposite side of the body, overturning the view that the cortex could not be electrically excited.',
      'In the lecture\'s history of brain stimulation, their 1870 experiment followed a Roman electric-fish remedy: current on a dog\'s cortex moved its paw, localizing motor cortex.',
      'Penfield mapped the awake human cortex during surgery in the 1930s to 1950s; this pair stimulated the cortex of dogs, decades earlier.',
      'The two German scientists who in 1870 discovered motor cortex by electrically stimulating the cortex of dogs.'],
    learn:'Gustav Fritsch and Eduard Hitzig, German physicians who in 1870 applied weak electrical current to the exposed cortex of dogs and evoked movements of particular muscles on the opposite side of the body. This was the first experimental localization of motor cortex, and it showed that the cortex is electrically excitable and functionally specialized, supporting localization of function. Their work led to Ferrier\'s maps in monkeys and, later, to Penfield\'s maps in humans.' },

  { id:'experiential_response', answer:'Experiential response', aliases:['experiential responses','experiential phenomena','experiential phenomenon','experiential hallucination'], cat:'history', unit:'L9', source:'Lecture 9 (what did Penfield\'s patients experience?)',
    clues:[
      'Hughlings Jackson had described a similar "dreamy state" in epileptic auras in the 1880s, and later researchers argued that these are dreamlike constructions rather than replayed memories.',
      'They came from the temporal lobes, often near abnormal epileptic tissue, and stimulating the same site again could bring back the same tune or scene.',
      'In Penfield and Perot\'s 1963 report, only 40 of 520 patients had them, such as a 22-year-old woman who said "I hear my mother calling."',
      'Most stimulation sites produced simple tingling, twitching or flashes of light; these were rare, vivid and complex, such as hearing music or voices.',
      'A vivid, complex experience, such as hearing music or a familiar voice, evoked by electrically stimulating the temporal lobe of an awake patient (Penfield).'],
    learn:'A vivid, complex experience (hearing music or a familiar voice, seeing a scene, a feeling of reliving an event) evoked by electrical stimulation of the cortex, mostly the temporal lobe, in awake patients during epilepsy surgery. Penfield and Perot (1963) found them in only 40 of 520 patients whose temporal lobes were stimulated. Penfield thought they were replayed memories; most researchers now think they are reconstructions or dreamlike experiences, often from tissue near the seizure focus.' },

  { id:'direct_stimulation', answer:'Direct electrical stimulation', aliases:['DES','electrical brain stimulation','EBS','direct cortical stimulation','electrical stimulation mapping','ESM','cortical stimulation mapping','intracranial electrical stimulation','intracranial stimulation','electrocortical stimulation'], cat:'methods', unit:'L9', source:'Lecture 9 (how are patients stimulated today?)',
    clues:[
      'In clinical mapping it usually pulses about 50 times a second for a few seconds, and an afterdischarge, a brief seizure-like burst, warns the team to turn the current down.',
      'It passes a few milliamps between neighboring electrodes on or in the brain, and good studies include sham trials with no current and stimulation of control electrodes.',
      'In the lecture\'s prediction game it produced rainbows from color-selective cortex, laughter from the supplementary motor area and a "will to persevere" from the midcingulate cortex.',
      'TMS stimulates through the skull with a magnetic pulse; this passes current through electrodes placed right on or in the brain.',
      'Passing a brief electrical current through electrodes on the exposed brain or implanted in it, in awake patients, to map function or produce experiences.'],
    learn:'Electrical stimulation delivered through electrodes placed directly on the cortex (subdural grids and strips) or implanted in it (depth electrodes), usually in epilepsy patients before surgery or in patients kept awake during tumor surgery. Brief trains of current between a pair of electrodes can block a function (for example speech arrest, used to map tissue that must be spared) or produce an experience (tingling, flashes, distorted faces, laughter, an urge to move). Because patients are awake they can report what they feel, which is why sham trials without current are essential controls.' },

  { id:'ecog', answer:'Electrocorticography', aliases:['ECoG','electrocorticogram','intracranial EEG','iEEG','subdural grid','subdural grids','subdural electrodes','electrode grid','cortical surface recording'], cat:'methods', unit:'L9', source:'Lecture 9 (how are patients stimulated today?)',
    clues:[
      'Penfield and Jasper made it routine at the Montreal Neurological Institute in the 1940s and 1950s, recording from the exposed cortex during surgery to find where seizures began.',
      'Its electrodes sit beneath the skull and dura, so it picks up high-frequency activity (above about 70 Hz) that tracks local neural firing and is largely lost by the time signals reach the scalp.',
      'In the lecture\'s FFA study, face-selective electrodes recorded with it overlapped the fMRI face patch on the fusiform gyrus, and stimulating those same electrodes distorted faces.',
      'EEG records through the skull and scalp; this records directly from the surface of the brain.',
      'Recording electrical activity from grids or strips of electrodes placed directly on the surface of the cortex, usually in epilepsy patients before surgery.'],
    learn:'Recording of electrical activity from electrodes placed directly on the surface of the brain (subdural grids and strips), usually in epilepsy patients monitored for one to two weeks to find where their seizures start. Compared with scalp EEG it has much better spatial resolution and captures high-frequency (high-gamma) activity, and the same electrodes can be used for electrical stimulation mapping. Together with recordings from depth electrodes (stereo-EEG) it is called intracranial EEG.' },

  { id:'sma', answer:'Supplementary motor area', aliases:['SMA','supplementary motor cortex','supplementary motor areas','SMA proper'], cat:'anatomy', unit:'L9', source:'Lecture 9 (what will the patient report?)', lab:'Cortex_Explorer.html',
    clues:[
      'Penfield and Welch named it by 1949 and reported it fully in 1951, after finding that stimulating the medial wall of the hemisphere produced complex postures and vocalizations.',
      'It lies on the medial surface of the frontal lobe, just in front of the leg representation of the precentral gyrus, and is active when people plan or merely imagine a sequence of movements.',
      'In the lecture, stimulating a 2-by-2-cm spot of it in a 16-year-old patient produced a smile and then contagious laughter, which she blamed on whatever she was looking at, such as a picture of a horse (Fried et al., 1998).',
      'Primary motor cortex sends the commands that carry out movements; this area just in front of it on the medial wall helps plan and launch sequences of movements.',
      'The part of premotor cortex on the medial surface of the frontal lobe, involved in planning and initiating sequences of movements.'],
    learn:'A region of premotor cortex (medial Brodmann area 6) on the medial surface of the frontal lobe, in front of the leg area of primary motor cortex. It is involved in planning, initiating and sequencing movements, especially self-initiated ones. Penfield and Welch named it (1949) and described it in detail (1951). Stimulating its anterior part produced laughter with a feeling of merriment in patient A.K. (Fried et al., 1998), who attributed it to things around her.' },

  { id:'microstimulation', answer:'Microstimulation', aliases:['electrical microstimulation','intracortical microstimulation','ICMS','micro-stimulation','cortical microstimulation'], cat:'methods', unit:'L9', source:'Lecture 9 (MT microstimulation)',
    clues:[
      'Afraz, Kiani and Esteky (2006) used it at face-selective sites in monkey inferotemporal cortex and biased the animals toward calling noisy pictures faces.',
      'It uses currents of roughly 10 to 100 microamps through a fine electrode (10 in the MT studies, 50 in the face study), activating neurons within a few hundred micrometers of the tip.',
      'In the lecture\'s MT experiments (Salzman, Newsome and colleagues), applying it to a cluster of neurons that preferred one direction significantly shifted monkeys\' judgments in 89 of 139 experiments, almost always toward that direction.',
      'Optogenetics activates only genetically chosen cell types with light; this activates every neuron and axon near the electrode tip with a tiny current.',
      'Electrical stimulation through a fine electrode, with tiny currents, to activate a small cluster of neurons in an animal and test whether their activity is enough to change perception or behavior.'],
    learn:'Electrical stimulation through a fine microelectrode with very small currents (typically 10 to 100 microamps), activating neurons within a few hundred micrometers of the tip. In monkeys it tests sufficiency: stimulating a column of MT neurons tuned to one direction biased motion judgments toward that direction (Salzman, Britten and Newsome, 1990), and stimulating face-selective inferotemporal sites biased face judgments (Afraz et al., 2006). Unlike optogenetics, it activates all nearby elements, including passing axons.' },

  { id:'optogenetics', answer:'Optogenetics', aliases:['optogenetic','optogenetic stimulation','optogenetic control','optogenetic activation','optogenetic silencing','optogenetic manipulation'], cat:'methods', unit:'L9', source:'Lecture 9 study guide',
    clues:[
      'Francis Crick suggested in 1999 that neuroscience needed a way to control one cell type with light; the key demonstration came from Boyden, Zhang, Bamberg, Nagel and Deisseroth in 2005.',
      'Cell types are targeted with viral vectors carrying cell-specific promoters or with Cre-lox mouse lines, and light arrives through an implanted optical fiber.',
      'In the lecture\'s simulation, brief blue flashes made one neuron spike within a few milliseconds of each flash, and yellow light nearly silenced another.',
      'Electrical stimulation activates every neuron and axon near the electrode; this method activates or silences only genetically chosen cell types.',
      'Controlling the activity of genetically targeted neurons with light, using light-sensitive proteins borrowed from algae and microbes.'],
    learn:'A method for controlling particular types of neurons with light. Genes for light-sensitive microbial proteins (opsins) are delivered to chosen cells with viral vectors or Cre-lox mouse lines; light delivered through an optical fiber then activates them (channelrhodopsin-2, blue light) or silences them (halorhodopsin or archaerhodopsin, yellow or green light) with millisecond precision. It can test both necessity and sufficiency in animals, for example by reactivating fear-memory engram cells (Liu et al., 2012). Because it requires genetic modification it is used in animals; in humans it has so far been tried only in the retina.' },

  { id:'channelrhodopsin', answer:'Channelrhodopsin-2', aliases:['channelrhodopsin','channelrhodopsins','ChR2','ChR'], cat:'methods', unit:'L9', source:'Lecture 9 (optogenetics)',
    clues:[
      'Nagel, Hegemann and colleagues described it in 2003 in a single-celled green alga, Chlamydomonas reinhardtii, which uses it to swim toward light.',
      'It needs all-trans retinal, which mammalian brains already supply, and its H134R mutant, with larger currents, is the version in many Cre-dependent mouse lines.',
      'In the lecture\'s fear-memory experiment it was put into dentate gyrus cells active during learning, so that blue light could later reactivate them and make the mice freeze.',
      'Halorhodopsin pumps chloride in under yellow light and silences neurons; this opens under blue light, lets cations in and makes them fire.',
      'The light-gated ion channel from algae that makes neurons fire when blue light shines on them, the main activating tool of optogenetics.'],
    learn:'A light-gated cation channel from the green alga Chlamydomonas reinhardtii. When it absorbs blue light (around 470 nm) it opens and lets positive ions in, depolarizing the neuron and triggering spikes within milliseconds. Expressed in chosen neurons, it is the standard tool for activating them in optogenetics (Boyden et al., 2005).' },

  { id:'halorhodopsin', answer:'Halorhodopsin', aliases:['halorhodopsins','NpHR','eNpHR','eNpHR3.0'], cat:'methods', unit:'L9', source:'Lecture 9 (optogenetics)',
    clues:[
      'The version used in neuroscience comes from Natronomonas pharaonis, a salt-loving archaeon of salt lakes, and two groups introduced it as a neural silencer in 2007 (Han and Boyden; Zhang and colleagues).',
      'As a pump it moves only one ion per photon, so it needs bright, steady light, and long use can load cells with chloride and weaken their GABA inhibition afterward.',
      'In the lecture\'s simulation, a neuron firing 18 spikes per second dropped to about 0.5 spikes per second while the yellow light was on.',
      'Channelrhodopsin opens a cation channel under blue light and makes neurons fire; this pumps chloride in under yellow light and silences them.',
      'The light-driven chloride pump used in optogenetics to silence neurons with yellow light.'],
    learn:'A light-driven chloride pump from the archaeon Natronomonas pharaonis (NpHR). Under yellow light (around 590 nm) it pumps chloride ions into the neuron, hyperpolarizing it and suppressing firing. It is used in optogenetics to silence chosen neurons and so test their necessity; archaerhodopsin (Arch), a proton pump driven by green-yellow light, is another silencer.' },

  { id:'engram', answer:'Engram', aliases:['engrams','engram cell','engram cells','memory engram','memory trace','memory traces'], cat:'memory', unit:'L9', source:'Lecture 9 (can light switch on a memory?)',
    clues:[
      'Richard Semon coined the word in 1904, and Karl Lashley spent decades lesioning rats\' cortex in a failed search for one, concluding that it is not stored in any single place.',
      'Today it is identified by tagging the cells active during learning with an activity-dependent genetic switch, then reactivating or silencing just those cells later.',
      'In the lecture, light that reactivated tagged dentate gyrus cells made mice freeze in a safe box (Liu et al., 2012), and a later study used the same approach to create a false memory (Ramirez et al., 2013).',
      'Consolidation is the process that stabilizes a memory over time; this is the physical trace itself, the cells and connections that hold it.',
      'The physical trace of a memory in the brain: the set of neurons and connections whose reactivation brings the memory back.'],
    learn:'The physical trace of a specific memory: the population of neurons (and their synaptic changes) active during learning whose reactivation produces recall. The idea comes from Semon (1904); Lashley failed to localize it with lesions. Modern studies tag cells active during learning and manipulate them with optogenetics: reactivating dentate gyrus engram cells made mice freeze as if recalling a shock (Liu et al., 2012), and reactivating the engram of a safe box while the mouse was shocked elsewhere created a false fear of that box (Ramirez et al., 2013).' },

  { id:'dbs', answer:'Deep brain stimulation', aliases:['DBS','brain pacemaker'], cat:'methods', unit:'L9', source:'Lecture 9 study guide',
    clues:[
      'Alim-Louis Benabid discovered its use in 1987 while testing a thalamic target before making a lesion: high-frequency current stopped the tremor just as the lesion would have.',
      'Its leads carry several contacts (classically four), and for each patient programmers choose which ones to use, the pulse width (often about 60 microseconds) and the amplitude, typically at about 130 pulses per second.',
      'In the lecture it targeted the subthalamic nucleus or globus pallidus in Parkinson\'s disease; more than 250,000 devices have been implanted, and how it works is still debated.',
      'TMS stimulates the cortex from outside the head for minutes at a time; this stimulates subcortical structures through implanted electrodes, day and night, for years.',
      'A treatment in which electrodes implanted in subcortical structures deliver continuous high-frequency electrical pulses, used for Parkinson\'s disease and tremor.'],
    learn:'A neurosurgical treatment in which electrodes implanted in deep brain structures deliver continuous high-frequency electrical pulses (about 130 Hz) from a pulse generator in the chest. It is FDA-approved for essential tremor (1997), Parkinson\'s disease (2002; targets the subthalamic nucleus or globus pallidus) and epilepsy (2018), with humanitarian exemptions for dystonia and OCD; it is not approved for depression. Discovered by Benabid (1987), it mimics a lesion but is adjustable and reversible. Its mechanism is debated: jamming local activity, activating passing axons, disrupting pathological beta oscillations.' },

  { id:'stn', answer:'Subthalamic nucleus', aliases:['STN','subthalamic nuclei','subthalamus','nucleus of Luys','body of Luys'], cat:'anatomy', unit:'L9', source:'Lecture 9 (what is deep brain stimulation?)',
    clues:[
      'Damage to it on one side, usually from a small stroke, causes hemiballismus: violent, involuntary flinging of the arm and leg on the opposite side.',
      'This small, lens-shaped nucleus is the only excitatory (glutamate-releasing) nucleus of the basal ganglia, driving the inhibitory output nuclei.',
      'In the lecture it was one of the two standard DBS targets for Parkinson\'s disease, and stimulation there sometimes made patients more impulsive or hypomanic.',
      'The globus pallidus is the other common DBS target for Parkinson\'s disease; this is the smaller nucleus just below the thalamus.',
      'The small nucleus below the thalamus, part of the basal ganglia circuit, that is the most common target of deep brain stimulation for Parkinson\'s disease.'],
    learn:'A small, lens-shaped nucleus of the basal ganglia circuit lying below the thalamus. Its glutamatergic neurons excite the basal ganglia output nuclei (globus pallidus internus and substantia nigra pars reticulata). In Parkinson\'s disease it becomes overactive and shows exaggerated beta oscillations, and it is the most common target of deep brain stimulation (with the globus pallidus). Damage to it causes hemiballismus, and stimulating it can sometimes increase impulsivity.' },

  { id:'beta_oscillations', answer:'Beta oscillations', aliases:['beta oscillation','beta waves','beta wave','beta band','beta rhythm','beta activity','beta power','beta-band oscillations','beta band activity'], cat:'neuron', unit:'L9', source:'Lecture 9 (how does DBS work?)',
    clues:[
      'Brown and colleagues found them exaggerated in recordings from DBS electrodes in Parkinson\'s patients, and dopamine medication reduced them along with stiffness and slowness.',
      'Over motor cortex they drop just before and during a movement and rebound above baseline as soon as the movement ends.',
      'In the lecture, exaggerated versions of them in Parkinson\'s disease (about 13 to 30 per second) were one idea for what DBS disrupts, and the 2025 adaptive DBS system raises stimulation when their power climbs.',
      'Gamma rhythms run faster, above about 30 Hz; these sit just below them, between alpha and gamma.',
      'Brain rhythms of roughly 13 to 30 Hz, prominent in motor circuits and exaggerated in Parkinson\'s disease.'],
    learn:'Neural oscillations of roughly 13 to 30 Hz, prominent in sensorimotor cortex and the basal ganglia. Beta power decreases before and during movement and rebounds afterward. In Parkinson\'s disease beta oscillations in the subthalamic nucleus and basal ganglia are exaggerated and track stiffness and slowness; dopamine medication and DBS reduce them. Adaptive DBS uses beta power recorded from the stimulating electrodes as a biomarker to adjust stimulation.' },

  { id:'closed_loop', answer:'Closed-loop stimulation', aliases:['closed-loop','closed loop','closed-loop neuromodulation','closed-loop neurostimulation','closed-loop DBS','adaptive DBS','aDBS','adaptive deep brain stimulation','responsive neurostimulation','RNS','responsive stimulation'], cat:'methods', unit:'L9', source:'Lecture 9 (adaptive DBS)',
    clues:[
      'Scangos and colleagues (2021) built a personalized version for one woman with severe depression: a signal recorded in her amygdala triggered brief stimulation of the ventral striatum.',
      'A key engineering problem is recording tiny brain signals through the same leads that deliver much larger pulses, so the device must filter out its own stimulation.',
      'In the lecture, the FDA approved this kind of DBS for Parkinson\'s disease in February 2025, tracking beta power, and a similar epilepsy device (2013) detects the start of a seizure and answers with a burst of current.',
      'Conventional DBS delivers the same pulses day and night; this adjusts stimulation in real time according to the brain\'s own signals.',
      'Brain stimulation that switches on or adjusts itself automatically in response to activity recorded from the brain.'],
    learn:'Stimulation controlled by the brain\'s own signals rather than delivered continuously at fixed settings. Adaptive DBS for Parkinson\'s disease (FDA, February 2025) records local field potentials through the stimulating leads and raises or lowers the current as beta power crosses thresholds. Responsive neurostimulation for epilepsy (NeuroPace RNS, FDA 2013) detects the onset of a seizure and responds with stimulation. Personalized closed-loop DBS has also been tested for depression (Scangos et al., 2021).' },

  { id:'nucleus_accumbens', answer:'Nucleus accumbens', aliases:['NAcc','NAc','accumbens','accumbens nucleus','nucleus accumbens septi','ventral striatum'], cat:'anatomy', unit:'L9', source:'Lecture 9 (when stimulation changes the person)', lab:'MRI_Explorer.html',
    clues:[
      'Its Latin name means "the nucleus lying against the septum," and its dopamine release rises with drugs of abuse and with unexpected rewards.',
      'It has a core and a shell and gets input from the prefrontal cortex, amygdala and hippocampus as well as dopamine from the ventral tegmental area.',
      'In the lecture, DBS here for OCD turned a man into a Johnny Cash fan, and it was also the target of the focused ultrasound study read for Wednesday (Yaakub et al., 2025).',
      'The subthalamic nucleus is a DBS target for movement disorders; this reward structure deep in the front of the brain has been a DBS target for OCD.',
      'The reward-related nucleus where the caudate and putamen meet, below the front of the lateral ventricle.'],
    learn:'A nucleus of the ventral striatum where the head of the caudate and the putamen meet, below the front of the lateral ventricle. It receives dopamine from the ventral tegmental area and input from prefrontal cortex, amygdala and hippocampus, and is central to reward, motivation and addiction. It is an experimental DBS target for OCD (the Johnny Cash case, Mantione et al., 2014) and was the target of low-intensity focused ultrasound in Yaakub et al. (2025).' },

  { id:'virtual_lesion', answer:'Virtual lesion', aliases:['virtual lesions','reversible lesion','reversible lesions','transient lesion','temporary lesion','virtual lesion method'], cat:'methods', unit:'L9', source:'Lecture 9 study guide',
    clues:[
      'Pascual-Leone, Walsh and Rothwell (2000) and Walsh and Cowey (2000) laid out the approach, arguing that it avoids the reorganization that follows real brain damage.',
      'Its effects last milliseconds to minutes, so each person can serve as their own control, and the moment of disruption can be chosen to the millisecond.',
      'In the lecture, TMS to the right TPJ made attempted harms seem more acceptable (Young et al., 2010): a brief disruption in healthy people showing the region is needed for weighing intentions.',
      'A patient\'s lesion is permanent, large and variable, and the brain reorganizes afterward; this is a brief, controlled disruption in a healthy brain.',
      'A temporary, reversible disruption of a brain region\'s function, usually with TMS, used to test whether the region is necessary for a task.'],
    learn:'A brief, reversible disruption of a brain region\'s activity, usually produced with TMS (single pulses during a task, or repetitive TMS beforehand), that mimics the effect of a lesion. Compared with patient lesions it can be placed precisely, timed to the millisecond and repeated in healthy people who serve as their own controls, and it wears off before the brain can reorganize. It tests necessity. Limits: only the outer cortex is reachable, effects spread to connected areas, and the click and scalp sensation complicate sham controls.' },

  { id:'chronometry', answer:'Chronometry', aliases:['TMS chronometry','chronometric TMS','mental chronometry','chronometric'], cat:'methods', unit:'L9', source:'Lecture 9 (TMS as a virtual lesion)',
    clues:[
      'Franciscus Donders founded its reaction-time version in 1868, subtracting the time taken by a simpler task from a harder one to estimate how long a mental step takes.',
      'It needs single or paired pulses delivered during each trial, not rTMS beforehand, because only a brief pulse pins the disruption to one moment.',
      'In the lecture\'s classic example (Amassian et al., 1989), a pulse over the occipital lobe 80 to 100 ms after three letters flashed left people unable to report them, while earlier or later pulses did little.',
      'A virtual lesion study asks whether an area is needed; this approach asks when it is needed, by varying the timing of the pulse.',
      'Using precisely timed TMS pulses to find when, not just where, a brain area is needed for a task.'],
    learn:'The measurement of the timing of mental processes. Donders (1868) inferred it from differences in reaction time; TMS chronometry delivers pulses at different delays after a stimulus to find when a region\'s activity is necessary. Amassian et al. (1989) found that an occipital pulse 80 to 100 ms after briefly flashed letters made them impossible to report, showing when visual cortex does its essential work.' },

  { id:'rtms', answer:'Repetitive TMS', aliases:['rTMS','repetitive transcranial magnetic stimulation','low-frequency rTMS','high-frequency rTMS'], cat:'methods', unit:'L9', source:'Lecture 9 (repetitive TMS)',
    clues:[
      'Its first major safety guidelines (Wassermann, 1998) were written partly because high-frequency trains had occasionally triggered seizures in healthy volunteers.',
      'Each session delivers hundreds to thousands of pulses in trains, and its after-effects are thought to involve LTP-like and LTD-like changes in synaptic strength.',
      'In the lecture, slow trains of about one pulse per second quieted the cortex, fast trains of 5 to 20 per second excited it, and daily sessions over the left DLPFC were FDA-cleared for depression in 2008.',
      'A single TMS pulse disrupts processing for milliseconds; trains of pulses like these change excitability for minutes to an hour after they stop.',
      'Delivering trains of magnetic pulses over the scalp to produce changes in cortical excitability that outlast the stimulation.'],
    learn:'TMS delivered as trains of pulses. Low-frequency trains (about 1 Hz) tend to reduce cortical excitability and high-frequency trains (5 to 20 Hz) tend to increase it, for minutes to an hour afterward, probably through LTP-like and LTD-like plasticity; responses vary greatly between individuals. It is used offline as a virtual lesion in research (for example 1 Hz rTMS to the right TPJ in Young et al., 2010) and clinically for depression (left DLPFC, FDA 2008), OCD and smoking cessation.' },

  { id:'tbs', answer:'Theta-burst stimulation', aliases:['TBS','theta burst','theta-burst','theta burst TMS','iTBS','cTBS','intermittent theta burst','intermittent theta-burst stimulation','continuous theta burst','continuous theta-burst stimulation'], cat:'methods', unit:'L9', source:'Lecture 9 (repetitive TMS)',
    clues:[
      'Huang and colleagues (2005) introduced it in humans, borrowing a pattern used to induce long-term potentiation in the hippocampus, which mimics how hippocampal neurons fire during exploration.',
      'A 40-second train of 600 pulses tends to suppress motor-evoked potentials for up to an hour, while the same pulses given in 2-second trains every 10 seconds raise them.',
      'In the lecture, 3-minute sessions of it worked as well as 37-minute standard sessions for depression, and the SAINT protocol gave ten of them a day for five days.',
      'Standard rTMS uses evenly spaced pulses at 1 to 20 Hz; this packs pulses into rapid triplets and produces similar after-effects in a fraction of the time.',
      'A patterned form of rTMS that delivers groups of three 50-Hz pulses five times per second, producing lasting changes in excitability within minutes.'],
    learn:'A patterned form of repetitive TMS (Huang et al., 2005): bursts of 3 pulses at 50 Hz repeated at 5 Hz, the theta rhythm. Continuous TBS (cTBS, 40 s, 600 pulses) tends to suppress cortical excitability for up to about an hour; intermittent TBS (iTBS, about 3 minutes) tends to facilitate it. It is much quicker than standard rTMS: in depression, 3-minute iTBS was as effective as 37-minute 10 Hz rTMS (the THREE-D trial), and accelerated iTBS is the basis of SAINT.' },

  { id:'snt', answer:'Stanford Neuromodulation Therapy', aliases:['SNT','SAINT','SAINT protocol','Stanford accelerated intelligent neuromodulation therapy','accelerated TMS','accelerated theta burst','accelerated iTBS'], cat:'methods', unit:'L9', source:'Lecture 9 (TMS for depression)',
    clues:[
      'Its targeting builds on Fox et al. (2012), who found that the most effective rTMS sites for depression were those whose resting activity was most anticorrelated with the subgenual cingulate.',
      'It compresses treatment into five days: ten sessions of intermittent theta bursts a day, 50 minutes apart, 1,800 pulses each, 90,000 pulses in all.',
      'In the lecture\'s trial (Cole et al., 2022), 78.6% of patients reached remission in the four weeks after treatment, versus 13.3% with sham; each target was chosen from that person\'s resting-state fMRI.',
      'Standard rTMS for depression aims at a scalp location over the left DLPFC for 4 to 6 weeks; this protocol aims at a spot chosen from each person\'s connectivity and finishes in five days.',
      'The rapid, individually targeted theta-burst TMS treatment for depression, cleared by the FDA in 2022.'],
    learn:'Stanford Neuromodulation Therapy (originally SAINT), FDA-cleared in September 2022 for treatment-resistant depression. Each patient\'s target is the spot in left dorsolateral prefrontal cortex whose resting-state fMRI signal is most anticorrelated with the subgenual cingulate cortex; treatment is ten sessions of intermittent theta-burst stimulation a day, 50 minutes apart, for five days. In a small sham-controlled trial (Cole et al., 2022), 78.6% remitted vs 13.3% with sham. It links functional connectivity (Lecture 7) to treatment.' },

  { id:'sgacc', answer:'Subgenual cingulate cortex', aliases:['subgenual cingulate','sgACC','subgenual anterior cingulate cortex','subgenual anterior cingulate','subgenual ACC','subcallosal cingulate','subcallosal cingulate cortex','SCC','BA25','Cg25'], cat:'anatomy', unit:'L9', source:'Lecture 9 (TMS for depression)',
    clues:[
      'Mayberg and colleagues (2005) implanted DBS electrodes in the white matter beside it in six patients with treatment-resistant depression, after imaging had found it overactive in depression.',
      'Its activity tends to fall when antidepressant drugs or other treatments work, and it connects with the amygdala, hypothalamus and brainstem centers for mood and stress.',
      'In the lecture it guided two depression treatments: DBS aimed at the white matter beside it (Lecture 7), and SAINT\'s TMS target, the prefrontal spot most anticorrelated with it.',
      'The dorsolateral prefrontal cortex is where the TMS coil is placed; this deep medial region is what the target is chosen to influence through its connections.',
      'The part of the anterior cingulate cortex beneath the front of the corpus callosum, often overactive in depression and a target for DBS.'],
    learn:'The part of the anterior cingulate cortex below the genu of the corpus callosum (roughly Brodmann area 25), also called subcallosal cingulate cortex. It is linked to mood and is often overactive in depression. DBS of the white matter beside it was tried for depression (Mayberg et al., 2005); the larger BROADEN trial failed, but in a separate 16-patient study every responder\'s stimulation reached the same three tracts (Riva-Posse et al., 2014). SAINT targets the left prefrontal site whose resting activity is most anticorrelated with it.' },

  { id:'dlpfc', answer:'Dorsolateral prefrontal cortex', aliases:['DLPFC','dlPFC','dorsolateral PFC','dorsolateral prefrontal','left DLPFC','dorsolateral frontal cortex','lateral prefrontal cortex'], cat:'anatomy', unit:'L9', source:'Lecture 9 (TMS for depression)', lab:'Cortex_Explorer.html',
    clues:[
      'Knoch and colleagues (2006) found that disrupting its right side with rTMS made people accept more unfair offers in the ultimatum game, even though they still judged the offers unfair.',
      'It lies on the middle frontal gyrus (roughly Brodmann areas 9 and 46) and is central to working memory, planning and cognitive control.',
      'In the lecture, standard rTMS for depression (FDA, 2008) is aimed at its left side, daily for 4 to 6 weeks.',
      'The subgenual cingulate is a deep medial region involved in mood; this region on the outer surface is within reach of a TMS coil and can influence the deep region through their connections.',
      'The region of prefrontal cortex on the upper outer surface of the frontal lobe, involved in working memory and cognitive control, and the standard TMS target for depression.'],
    learn:'A region of lateral prefrontal cortex on the middle frontal gyrus (roughly Brodmann areas 9 and 46), important for working memory, planning, rule use and cognitive control. The left DLPFC is the standard rTMS target for depression (FDA, 2008), and SAINT chooses the spot within it most anticorrelated with the subgenual cingulate. Disrupting the right DLPFC with rTMS increased acceptance of unfair offers (Knoch et al., 2006).' },

  { id:'tpj', answer:'Temporoparietal junction', aliases:['TPJ','right TPJ','rTPJ','temporo-parietal junction','right temporoparietal junction','temporoparietal cortex'], cat:'anatomy', unit:'L9', source:'Lecture 9 (TMS can change moral judgments)', lab:'Cortex_Explorer.html',
    clues:[
      'Blanke and colleagues (2002) produced an out-of-body experience by electrically stimulating it in an epilepsy patient, who saw herself lying in bed from above.',
      'Rebecca Saxe\'s fMRI studies found its right side active when people think about what others believe or intend, the "theory of mind" region; it is also a hub of the ventral attention network.',
      'In the lecture, disrupting its right side with TMS made people judge a woman who tried but failed to poison a friend less harshly, so intentions counted less (Young et al., 2010).',
      'The dorsolateral prefrontal cortex supports cognitive control; this posterior region supports reasoning about other people\'s beliefs and intentions.',
      'The region where the temporal and parietal lobes meet, around the back of the superior temporal sulcus and the angular gyrus, involved in theory of mind and in reorienting attention.'],
    learn:'The region where the temporal and parietal lobes meet, around the posterior superior temporal sulcus and the supramarginal and angular gyri. The right TPJ is active when people reason about others\' beliefs and intentions (theory of mind; Saxe) and is a hub of the ventral attention network. TMS to the right TPJ made people weigh intentions less in moral judgments (Young et al., 2010), and electrical stimulation there has produced out-of-body experiences (Blanke et al., 2002).' },

  { id:'tdcs', answer:'tDCS', aliases:['transcranial direct current stimulation','direct current stimulation','anodal tDCS','cathodal tDCS','transcranial DC stimulation','HD-tDCS'], cat:'methods', unit:'L9', source:'Lecture 9 study guide',
    clues:[
      'Lippold and Redfearn reported mood changes from it in 1964, Nitsche and Paulus (2000) revived it, and in 2016 neurologists wrote an open letter warning do-it-yourself users.',
      'Its field polarizes neurons only slightly, about 0.12 mV per V/m in rat neurons, and its effects depend on cell orientation and on what the brain is doing.',
      'In the lecture, about 75% of the current never reached the brain in cadavers, and a review of 59 analyses found no reliable cognitive effect in healthy adults, yet a home device was FDA-approved for depression in December 2025.',
      'TMS induces fields of about 75 to 150 V/m that make neurons fire; this produces fields around 1 V/m or less and never makes neurons fire on its own.',
      'Brain stimulation that passes a weak, constant electrical current between electrodes on the scalp to shift cortical excitability.'],
    learn:'Transcranial direct current stimulation: a weak constant current (typically 1 to 2 mA for 10 to 30 minutes) passed between sponge electrodes on the scalp. Under the anode neurons become slightly depolarized and more excitable; under the cathode, less. It never makes neurons fire on its own, and much of the current is shunted by the scalp and skull (fields in the brain of about 0.3 to 1 V/m at 2 mA). Effects on cognition in healthy people are small or absent and can involve trade-offs, but a home tDCS device was FDA-approved for depression in December 2025, after a trial by Woodham et al. (2024).' },

  { id:'tacs', answer:'tACS', aliases:['transcranial alternating current stimulation','alternating current stimulation','transcranial AC stimulation','HD-tACS'], cat:'methods', unit:'L9', source:'Lecture 9 study guide',
    clues:[
      'Reinhart and Nguyen (2019) reported that 25 minutes of it, tuned to each person\'s brain rhythms, temporarily brought older adults\' working memory up to the level of young adults\'.',
      'At some frequencies it makes people see flickering light by stimulating the retina, and its artifact swamps EEG at the very frequency applied, so its effects are hard to record.',
      'In the lecture it was the weak-current partner of tDCS, and the cadaver measurements showing that most scalp current never reaches the brain were in fact made with this kind of current.',
      'tDCS delivers a steady current that shifts excitability in one direction; this delivers a current that oscillates at a chosen frequency, to entrain brain rhythms.',
      'Brain stimulation that passes a weak electrical current oscillating at a chosen frequency between scalp electrodes, to influence brain oscillations.'],
    learn:'Transcranial alternating current stimulation: a weak current (about 1 to 2 mA) passed between scalp electrodes that oscillates sinusoidally at a chosen frequency, such as alpha (10 Hz) or gamma (40 Hz). The aim is to entrain or modulate the brain\'s own oscillations rather than to shift excitability in one direction as tDCS does. Like tDCS, much of its current is shunted by the scalp and skull, and some effects may come from stimulating the skin or the retina (flickering phosphenes); some studies report cognitive effects, such as improved working memory in older adults (Reinhart and Nguyen, 2019).' },

  { id:'temporal_interference', answer:'Temporal interference stimulation', aliases:['temporal interference','TI stimulation','TI','tTIS','transcranial temporal interference stimulation','temporally interfering electric fields','interferential stimulation'], cat:'methods', unit:'L9', source:'Lecture 9 (temporal interference)',
    clues:[
      'Grossman and colleagues (2017) first demonstrated it in mice, driving neurons in the hippocampus without driving the cortex above it.',
      'In cadavers its effective deep field was only about 0.1 V/m per mA at hippocampal depth, while its kilohertz fields still pass through the cortex on the way.',
      'In the lecture\'s first human hippocampus study (Violante et al., 2023), carriers of 2,000 and 2,005 Hz produced a 5 Hz beat deep in the brain and slightly improved memory for face-name pairs.',
      'tACS is strongest in the cortex nearest the electrodes; this aims at a deep spot where two fast currents meet.',
      'Noninvasive stimulation using two high-frequency currents at slightly different frequencies, which combine where they overlap to produce a slow beat deep in the brain.'],
    learn:'A noninvasive method that applies two high-frequency alternating currents (for example 2,000 and 2,005 Hz) through separate pairs of scalp electrodes. Neurons do not follow the fast carriers, but where the fields overlap their envelope beats at the difference frequency (5 Hz), which neurons can follow, so stimulation can in principle be steered to deep targets. It has been shown in mice (Grossman et al., 2017) and in humans for the hippocampus (Violante et al., 2023) and striatum (Wessel et al., 2023); the deep fields are weak and the technique is young.' },

  { id:'focused_ultrasound', answer:'Focused ultrasound', aliases:['FUS','transcranial focused ultrasound','tFUS','transcranial ultrasound stimulation','TUS','low-intensity focused ultrasound','LIFU','MR-guided focused ultrasound','MRgFUS','high-intensity focused ultrasound','HIFU','ultrasound neuromodulation','ultrasound stimulation'], cat:'methods', unit:'L9', source:'Lecture 9 (focused ultrasound)',
    clues:[
      'William Fry\'s group at the University of Illinois used it in the 1950s to make small lesions deep in the brain, and in 1958 reported that it could reversibly suppress visual responses in cats.',
      'It is run at about 200 to 800 kHz, low enough to cross the skull, forms a focus a few millimeters wide but much longer, and may act through mechanosensitive ion channels.',
      'In the lecture, its high-power form destroys a tiny thalamic target to ease essential tremor without an incision (FDA, 2016), and its low-power form must control for a faint buzz that can be heard.',
      'tDCS and TMS lose focus with depth; this method can reach deep structures with millimeter precision without surgery.',
      'Noninvasive stimulation or ablation that aims sound waves through the skull at a small, deep target.'],
    learn:'Sound waves above the range of hearing, focused through the skull by a curved transducer onto a spot a few millimeters wide (and longer along the beam). At high intensity it heats and destroys tissue: MR-guided focused ultrasound thalamotomy was FDA-approved for essential tremor in 2016 (47% vs about 1% improvement with sham; Elias et al., 2016). At low intensity (transcranial ultrasound stimulation, about 200 to 800 kHz) it can reversibly change neural activity, first shown in human somatosensory cortex (Legon et al., 2014) and since in deep targets such as the nucleus accumbens (Yaakub et al., 2025). Studies must control for its audible buzz.' },

  { id:'sham', answer:'Sham stimulation', aliases:['sham','sham condition','sham control','sham TMS','sham tDCS','sham trial','sham trials','placebo stimulation','sham coil','sham surgery'], cat:'methods', unit:'L9', source:'Lecture 9 (ultrasound needs careful controls)',
    clues:[
      'For tDCS the usual version ramps the current up for about 30 seconds and back down, mimicking the tingling at the start, yet many participants can still tell the difference at 2 mA.',
      'For TMS it may use a coil that clicks without delivering a strong field, sometimes with scalp electrodes that mimic the tap, because the loud click and scalp sensation alone can change behavior.',
      'In the lectures, 13.3% of the SAINT trial\'s control group remitted with it, 17% responded to it in the BROADEN DBS trial, and a good ultrasound study played a matching sound during it.',
      'An active control site is real stimulation of a different region; this is fake stimulation of the same region that should sound and feel identical.',
      'A fake stimulation condition that mimics the sounds and sensations of real stimulation without its effect on the brain, used as a placebo control.'],
    learn:'A control condition that imitates real stimulation (the coil\'s click, scalp tingling, the sound of ultrasound, even the surgery) without delivering the active effect, so that expectation, attention and sensory side effects are matched. Comparing real with sham stimulation separates placebo responses from true effects: in the lectures, sham gave 13.3% remission in the SAINT trial and 17% response in the BROADEN DBS trial. A good sham sounds and feels like the real thing; stimulating an active control site is a complementary control.' },

  { id:'vns', answer:'Vagus nerve stimulation', aliases:['VNS','vagal nerve stimulation','vagal stimulation','vagus nerve stimulator','Vivistim','transcutaneous vagus nerve stimulation','tVNS'], cat:'methods', unit:'L9', source:'Lecture 9 (which uses has the FDA authorized?)',
    clues:[
      'Jacob Zabara proposed it after finding that it reduced drug-induced seizures in dogs, and the first patient was implanted in 1988 in a trial led by J. Kiffin Penry.',
      'The signals it sends toward the head reach the brainstem and activate the locus coeruleus and basal forebrain, releasing norepinephrine and acetylcholine across the cortex.',
      'In the lecture\'s FDA quiz, pairing it with rehabilitation for arm weakness after stroke was authorized in 2021: brief bursts during each practice movement.',
      'DBS stimulates deep brain structures through electrodes in the brain; this stimulates a nerve in the neck that relays signals into the brainstem.',
      'Electrical stimulation of the cranial nerve in the neck that carries signals from the body to the brainstem, approved for epilepsy, depression and stroke rehabilitation.'],
    learn:'Electrical stimulation of the vagus nerve (cranial nerve X), usually by a cuff electrode around the left vagus in the neck connected to a pulse generator in the chest. Ascending vagal signals reach the brainstem and activate neuromodulatory systems such as the locus coeruleus (norepinephrine) and basal forebrain (acetylcholine). It is FDA-approved for epilepsy (1997), depression (2005) and, paired with movement practice, upper-limb rehabilitation after stroke (Vivistim, 2021).' },

  ]
};
