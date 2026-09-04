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
   - To release a new unit for the daily puzzle, set `released: true`.
   - `id` must be unique and never change once students have played
     (it is what the daily schedule and local stats key on).
   - `lab` (optional) links the learn card to a Brain Lab page.
   ===================================================================== */
window.COGNEURDLE = {
  version: 1,
  epoch: '2026-09-04',            // date of CogNeurdle #1 (local time)
  units: {
    L1: { name: 'Lecture 1 · Intro & neuroanatomy', released: true },
    L2: { name: 'Lecture 2 · Methods',              released: true },
    L3: { name: 'Lecture 3 · Neural decoding',      released: true },
  },
  categories: {
    history:     'People & history',
    neuron:      'Neurons & signaling',
    anatomy:     'Neuroanatomy',
    orientation: 'Orientation & planes',
    lesion:      'Brain damage & dissociations',
    methods:     'Methods',
    decoding:    'fMRI & decoding',
  },
  terms: [
  /* ---------------------------- LECTURE 1 ---------------------------- */
  { id:'phrenology', answer:'Phrenology', aliases:[], cat:'history', unit:'L1', source:'Lecture 1 study guide',
    clues:[
      'Its founder, Franz Joseph Gall, called it "organology"; the name everyone remembers was popularized by his collaborator Spurzheim.',
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
      'He wanted to be an artist as a boy; his father, an anatomy professor, steered him to medicine. His drawings now hang in art museums.',
      'He shared the 1906 Nobel Prize with the man whose technique he used, though the two disagreed bitterly, in their Nobel lectures, about what the technique showed.',
      'He refined a silver staining method so that only a few cells at a time were blackened in their entirety, which let him see single cells clearly.',
      'Where Golgi saw a continuous net (a reticulum), he saw separate cells that touched without fusing.',
      'The Spanish neuroanatomist whose drawings of stained neurons established that the nervous system is made of discrete cells: the neuron doctrine.'],
    learn:'Spanish neuroanatomist (1852–1934). Using an improved Golgi stain, he showed that neurons are separate cells that contact but do not fuse, establishing the neuron doctrine. He also proposed that signals flow in one direction (dendrite to axon). Nobel Prize 1906, shared with Golgi.' },

  { id:'neuron_doctrine', answer:'Neuron doctrine', aliases:['neuron theory','the neuron doctrine'], cat:'history', unit:'L1', source:'Lecture 1 study guide',
    clues:[
      'Wilhelm Waldeyer coined the word "neuron" in an 1891 review that gave this idea its name.',
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
      'The giant version in squid, up to a millimeter wide, is what let Hodgkin and Huxley put an electrode inside a nerve fiber.',
      'A neuron has exactly one of these (though it may branch), and it emerges from a cone-shaped region called the hillock.',
      'In many neurons it is wrapped in myelin, with small gaps (nodes of Ranvier) where the signal is regenerated.',
      'Dendrites carry signals toward the cell body; this carries the signal away from it.',
      'The long, thin output fiber of a neuron that conducts action potentials from the cell body to the presynaptic terminals.'],
    learn:'The single output fiber of a neuron. Action potentials are generated at the axon hillock and travel along the axon (often myelinated) to presynaptic terminals, where neurotransmitter is released.' },

  { id:'dendrite', answer:'Dendrite', aliases:['dendrites'], cat:'neuron', unit:'L1', source:'Lecture 1 study guide', lab:'Action_Potential_Explorer.html',
    clues:[
      'The name comes from the Greek for "tree," and the branching pattern (the arbor) is one of the main ways neurons are classified.',
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
      'Otto Loewi\'s 1921 experiment, which he said came to him in a dream, showed that a frog heart\'s vagus nerve releases a chemical (later identified as acetylcholine) that slows a second heart.',
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
      'Its axons are myelinated by Schwann cells rather than oligodendrocytes, which is one reason it can regenerate after injury while the CNS mostly cannot.',
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
      'From the Latin dorsum, "back"; the fin on a shark\'s back and this direction share a name.',
      'In the spinal cord it is unambiguous: it points toward the back. In the human brain the axis bends by about 90 degrees.',
      'Because the human neuraxis bends, in the brain this direction means the same as "superior."',
      'Ventral is toward the belly; this is its opposite.',
      'The anatomical direction meaning toward the back of the body, and toward the top of the human brain.'],
    learn:'Toward the back (of an animal). Because the human brain sits at a right angle to the spinal cord, dorsal in the brain means toward the top (superior). Opposite of ventral.' },

  { id:'ventral', answer:'Ventral', aliases:[], cat:'orientation', unit:'L1', source:'Lecture 1 study guide', lab:'MRI_Explorer.html',
    clues:[
      'From the Latin venter, "belly"; the same root gives "ventricle," a belly-like cavity.',
      'In the human brain this direction coincides with "inferior," toward the base of the skull.',
      'The visual pathway named for this direction runs from occipital cortex into the temporal lobe and handles object identity ("what").',
      'Dorsal is toward the back; this is its opposite.',
      'The anatomical direction meaning toward the belly, and toward the bottom of the human brain.'],
    learn:'Toward the belly (of an animal). In the human brain, ventral means toward the bottom (inferior). Opposite of dorsal.' },

  { id:'lateral', answer:'Lateral', aliases:[], cat:'orientation', unit:'L1', source:'Lecture 1 study guide', lab:'MRI_Explorer.html',
    clues:[
      'The lateral geniculate nucleus and the lateral ventricles carry this word because of where they sit relative to the midline.',
      '"Ipsilateral" and "contralateral" describe whether two things are on the same or opposite sides; this word on its own describes distance from the midline.',
      'The temporal lobes are the most extreme example of this direction in the cerebral cortex.',
      'Medial is toward the midline; this is away from it.',
      'The anatomical direction meaning toward the side, away from the midline.'],
    learn:'Away from the midline, toward the side. Opposite of medial.' },

  { id:'medial', answer:'Medial', aliases:[], cat:'orientation', unit:'L1', source:'Lecture 1 study guide', lab:'MRI_Explorer.html',
    clues:[
      'The medial temporal lobe and the medial prefrontal cortex are named with this word because they face the midline, largely hidden inside the interhemispheric fissure.',
      'Structures with this label are best seen on a sagittal slice through the middle of the brain.',
      'The corpus callosum is the most obvious structure in this position in the brain.',
      'Lateral is away from the midline; this is toward it.',
      'The anatomical direction meaning toward the midline of the body or brain.'],
    learn:'Toward the midline. Opposite of lateral.' },

  { id:'anterior', answer:'Anterior', aliases:['rostral'], cat:'orientation', unit:'L1', source:'Lecture 1 study guide', lab:'MRI_Explorer.html',
    clues:[
      'In brain anatomy it is a synonym of "rostral," from the Latin for "beak."',
      'The commissure with this name is a small bundle of fibers connecting the two temporal lobes, far smaller than the corpus callosum.',
      'The frontal lobe is the most extreme example of this direction in the brain.',
      'Posterior is toward the back of the head; this is toward the face.',
      'The anatomical direction meaning toward the front.'],
    learn:'Toward the front. In the brain, equivalent to rostral. Opposite of posterior (caudal).' },

  { id:'posterior', answer:'Posterior', aliases:['caudal'], cat:'orientation', unit:'L1', source:'Lecture 1 study guide', lab:'MRI_Explorer.html',
    clues:[
      'In brain anatomy it is a synonym of "caudal," from the Latin for "tail."',
      'Combined with "parietal" it names the cortex most implicated in spatial attention and in reaching for what you see.',
      'The occipital lobe is the most extreme example of this direction in the brain.',
      'Anterior is toward the face; this is toward the back of the head.',
      'The anatomical direction meaning toward the back or rear.'],
    learn:'Toward the back. In the brain, equivalent to caudal. Opposite of anterior (rostral).' },

  { id:'coronal', answer:'Coronal', aliases:['coronal plane','coronal slice','coronal section','frontal plane','coronal view'], cat:'orientation', unit:'L1', source:'Lecture 1 study guide', lab:'MRI_Explorer.html',
    clues:[
      'Named after the corona, a crown, because the plane runs along the line of a crown worn across the head from ear to ear.',
      'In the skull, the suture with this name joins the frontal bone to the two parietal bones.',
      'It is the plane in which you see both hemispheres and both temporal lobes at once, like a slice of bread cut from a loaf.',
      'A sagittal slice separates left from right; this plane separates front from back.',
      'The slice plane that divides the brain into front and back portions: a vertical cut from ear to ear.'],
    learn:'A vertical slice plane running from ear to ear, dividing the brain into anterior and posterior portions. Compare sagittal (left/right) and axial (top/bottom).' },

  { id:'sagittal', answer:'Sagittal', aliases:['sagittal plane','sagittal slice','sagittal section','midsagittal','sagittal view'], cat:'orientation', unit:'L1', source:'Lecture 1 study guide', lab:'MRI_Explorer.html',
    clues:[
      'Named after a skull suture that is in turn named for an arrow (Latin sagitta), because of its straight line.',
      'The "mid-" version passes exactly through the interhemispheric fissure and shows the corpus callosum in its full arch.',
      'On this slice you see one hemisphere in profile, with the frontal lobe at one edge and the occipital lobe at the other.',
      'A coronal slice separates front from back; this plane separates left from right.',
      'The slice plane that divides the brain into left and right portions: a vertical cut from front to back.'],
    learn:'A vertical slice plane running from front to back, dividing the brain into left and right portions. A midsagittal slice runs exactly down the midline. Compare coronal (front/back) and axial (top/bottom).' },

  { id:'axial', answer:'Axial', aliases:['horizontal','transverse','axial plane','axial slice','horizontal plane','transverse plane','horizontal slice','transverse slice','axial view','axial section'], cat:'orientation', unit:'L1', source:'Lecture 1 study guide', lab:'MRI_Explorer.html',
    clues:[
      'Because the human neuraxis bends, this plane is called "horizontal" in the brain but "transverse" in the spinal cord.',
      'It is the native slice plane of CT scanners and of most clinical MRI, so it is the view radiologists read first.',
      'Its most common name refers to the long axis of the body: the plane cuts across that axis.',
      'Coronal and sagittal slices are both vertical; this is the one that is horizontal.',
      'The slice plane that divides the brain into upper and lower portions: a horizontal cut.'],
    learn:'A horizontal slice plane dividing the brain into upper and lower portions. Also called horizontal or transverse. Compare coronal (front/back) and sagittal (left/right).' },

  { id:'frontal_lobe', answer:'Frontal lobe', aliases:['frontal','frontal cortex','frontal lobes'], cat:'anatomy', unit:'L1', source:'Lecture 1 study guide', lab:'Cortex_Explorer.html',
    clues:[
      'It makes up about a third of the cortical surface in humans, and its most anterior part is still maturing well into the third decade of life.',
      'Its posterior boundary is the central sulcus; its inferior boundary is the lateral (Sylvian) fissure.',
      'The strip along its back edge is primary motor cortex, the motor half of Penfield\'s map.',
      'The parietal lobe sits just behind the central sulcus; this lobe sits just in front of it.',
      'The largest lobe of the human brain, home to motor cortex, Broca\'s area, and the prefrontal cortex involved in planning and decision-making.'],
    learn:'The lobe anterior to the central sulcus and above the lateral fissure. Contains primary motor cortex (precentral gyrus), premotor areas, Broca\'s area, and prefrontal cortex (planning, working memory, decision-making).' },

  { id:'parietal_lobe', answer:'Parietal lobe', aliases:['parietal','parietal cortex','parietal lobes'], cat:'anatomy', unit:'L1', source:'Lecture 1 study guide', lab:'Cortex_Explorer.html',
    clues:[
      'Its name comes from the Latin paries, "wall," because the bone over it forms the side walls of the skull.',
      'Its anterior strip, just behind the central sulcus, is primary somatosensory cortex.',
      'Damage to its right side can cause hemispatial neglect, in which patients ignore the left half of space.',
      'The occipital lobe processes what you see; this lobe helps you know where it is and how to reach for it.',
      'The lobe at the top-back of the brain, behind the central sulcus, handling touch and spatial processing.'],
    learn:'The lobe posterior to the central sulcus and above the temporal lobe. Contains primary somatosensory cortex (postcentral gyrus) and association areas for spatial attention, spatial perception and sensorimotor integration.' },

  { id:'temporal_lobe', answer:'Temporal lobe', aliases:['temporal','temporal cortex','temporal lobes'], cat:'anatomy', unit:'L1', source:'Lecture 1 study guide', lab:'Cortex_Explorer.html',
    clues:[
      'Its name comes from the Latin tempus, "time," reportedly because hair first goes gray at the temples.',
      'Its inner (medial) surface folds around to become the hippocampus.',
      'Heschl\'s gyrus, buried on its upper surface, is primary auditory cortex.',
      'The frontal lobe sits above the lateral (Sylvian) fissure; this lobe sits below it.',
      'The lobe on the side of the brain, beneath the lateral fissure, involved in hearing, language comprehension and memory.'],
    learn:'The lobe below the lateral (Sylvian) fissure. Contains primary auditory cortex, Wernicke\'s area (in the left hemisphere), the ventral visual stream for object and face recognition, and medial structures for memory (hippocampus).' },

  { id:'occipital_lobe', answer:'Occipital lobe', aliases:['occipital','occipital cortex','occipital lobes'], cat:'anatomy', unit:'L1', source:'Lecture 1 study guide', lab:'Cortex_Explorer.html',
    clues:[
      'Its name is from the Latin ob + caput, "against the head": the back of the head.',
      'Its boundary with the parietal lobe is a clear sulcus on the medial surface and an arbitrary line on the lateral surface.',
      'Primary visual cortex lies along a sulcus on its medial surface (the calcarine sulcus), and each half sees the opposite visual field.',
      'The temporal lobe handles hearing; this lobe handles vision.',
      'The lobe at the very back of the brain, devoted almost entirely to vision.'],
    learn:'The most posterior lobe. Contains primary visual cortex (V1, along the calcarine sulcus) and surrounding visual areas. Each hemisphere\'s occipital lobe represents the contralateral half of the visual field.' },

  { id:'gray_matter', answer:'Gray matter', aliases:['grey matter'], cat:'anatomy', unit:'L1', source:'Lecture 1 study guide', lab:'MRI_Explorer.html',
    clues:[
      'It is not actually gray in a living brain: the gray color appears only after fixation drains the blood.',
      'Its darker color comes from the absence of the fatty insulation that makes the other tissue type pale.',
      'In the cerebrum it forms a sheet a few millimeters thick on the outside, plus clusters (nuclei) deep inside.',
      'White matter is the wiring; this is where the cell bodies, dendrites and synapses are.',
      'Brain tissue made mostly of neuron cell bodies, dendrites and synapses; the cortex is made of it.'],
    learn:'Nervous tissue rich in neuron cell bodies, dendrites, synapses and unmyelinated fibers. Forms the cerebral cortex and subcortical nuclei. Contrast with white matter (myelinated axons).' },

  { id:'white_matter', answer:'White matter', aliases:[], cat:'anatomy', unit:'L1', source:'Lecture 1 study guide', lab:'MRI_Explorer.html',
    clues:[
      'The substance that gives it its color is about 70–80% lipid by dry weight and is produced by oligodendrocytes.',
      'In humans it occupies nearly half the volume of the cerebrum, a far larger share than in small-brained mammals.',
      'DTI images it by following the direction in which water diffuses most easily.',
      'Gray matter does the computing; this is the cabling that connects one gray region to another.',
      'Brain tissue made mostly of myelinated axons, connecting different regions of gray matter.'],
    learn:'Nervous tissue made mostly of myelinated axons, whose fatty myelin gives it a pale color. It forms the connections (tracts) between gray-matter regions, e.g. the corpus callosum. Imaged with DTI.' },

  { id:'sulcus', answer:'Sulcus', aliases:['sulci'], cat:'anatomy', unit:'L1', source:'Lecture 1 study guide', lab:'Cortex_Explorer.html',
    clues:[
      'The plural is sulci; the Latin word originally meant a furrow left by a plow.',
      'About two-thirds of the human cortical surface is hidden inside these.',
      'Cortical folding is thought to arise because the outer layers of cortex expand faster than the layers beneath them.',
      'A gyrus is the ridge of cortex that sticks out; this is the groove between ridges.',
      'A groove or valley on the surface of the cerebral cortex.'],
    learn:'A groove in the folded surface of the cerebral cortex. Sulci separate gyri (ridges); a particularly deep sulcus is called a fissure. Folding lets a large cortical sheet fit inside the skull.' },

  { id:'gyrus', answer:'Gyrus', aliases:['gyri'], cat:'anatomy', unit:'L1', source:'Lecture 1 study guide', lab:'Cortex_Explorer.html',
    clues:[
      'From the Greek for "ring" or "circle"; the same root gives "gyrate" and "gyroscope."',
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
      'It is also called the fissure of Rolando, after the Italian anatomist Luigi Rolando, who described it in the 1820s.',
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
      'The famous cartoon was drawn by a medical illustrator, Hortense Cantlie, for Penfield and Rasmussen\'s 1950 book.',
      'Its proportions are distorted: the lips, tongue and hands are enormous and the trunk is tiny.',
      'There are two of them, roughly mirror images, on the front and back banks of the central sulcus.',
      'Retinotopy is the visual map; this is the name for the body map along motor and somatosensory cortex.',
      'Penfield\'s "little man": the distorted map of the body laid out along the motor and somatosensory strips of cortex.'],
    learn:'The map of the body along primary motor cortex (precentral gyrus) and primary somatosensory cortex (postcentral gyrus), discovered by Penfield\'s stimulation studies. Body parts are represented in proportion to their motor precision or sensory density, not their size.' },

  { id:'cortex', answer:'Cerebral cortex', aliases:['cortex','neocortex','the cortex'], cat:'anatomy', unit:'L1', source:'Lecture 1 (gross anatomy)', lab:'Cortex_Explorer.html',
    clues:[
      'The word is Latin for "bark," as on a tree; in humans it is 2–4 mm thick and would cover roughly a quarter of a square meter if unfolded.',
      'Most of it has six layers, and layer 4 is where input from the thalamus arrives.',
      'It holds only about 16 billion of the brain\'s 86 billion neurons; the cerebellum, tucked beneath it, has far more.',
      'The cerebellum has more neurons, but this structure is where sensation, language and planning are computed.',
      'The folded outer sheet of gray matter covering the cerebral hemispheres, divided into four lobes.'],
    learn:'The thin (2–4 mm), highly folded outer layer of gray matter of the cerebral hemispheres, divided into frontal, parietal, temporal and occipital lobes. Most of it is six-layered neocortex.' },

  /* ---------------------------- LECTURE 2 ---------------------------- */
  { id:'ischemic', answer:'Ischemic stroke', aliases:['ischemia','ischemic','ischaemic stroke'], cat:'lesion', unit:'L2', source:'Lecture 2 study guide',
    clues:[
      'The clot-dissolving drug tPA works only for this kind of stroke, and only within a few hours, which is why an emergency scan precedes treatment.',
      'It accounts for roughly 85% of all strokes.',
      'The dead tissue is called an infarct, and the surrounding at-risk zone the penumbra.',
      'A hemorrhagic stroke is a vessel bursting; this is a vessel being blocked.',
      'A stroke caused by a blood clot or other blockage cutting off the blood supply to part of the brain.'],
    learn:'A stroke caused by blockage of a blood vessel (by a clot or embolus), starving downstream tissue of oxygen and glucose. The most common type of stroke. Contrast with hemorrhagic stroke (bleeding).' },

  { id:'hemorrhagic', answer:'Hemorrhagic stroke', aliases:['hemorrhage','haemorrhagic stroke','brain hemorrhage','hemorrhagic','bleed'], cat:'lesion', unit:'L2', source:'Lecture 2 study guide',
    clues:[
      'Giving the clot-buster tPA to a patient with this kind of stroke would be disastrous, which is why stroke type is determined by imaging first.',
      'Its two main subtypes are named by where the blood goes: into the brain tissue itself or into the space beneath the arachnoid membrane.',
      'Its damage comes as much from the pressure and toxicity of pooled blood as from lost supply downstream.',
      'An ischemic stroke is a blocked vessel; this is a ruptured one.',
      'A stroke caused by bleeding in or around the brain when a blood vessel bursts.'],
    learn:'A stroke caused by the rupture of a blood vessel, with bleeding into brain tissue or the surrounding space. Less common than ischemic stroke but often more dangerous.' },

  { id:'lesion', answer:'Lesion', aliases:['lesions','lesion method','lesion studies','lesion study','brain lesion','brain damage'], cat:'lesion', unit:'L2', source:'Lecture 2 (methods)',
    clues:[
      'Paul Broca\'s 1861 patient "Tan" is the classic case: a damaged region, an inferred function, and an area that now carries Broca\'s name.',
      'In animals it can be made deliberately with heat, chemicals or surgery; in humans it comes from stroke, tumor, injury or surgery for epilepsy.',
      'Its logic is the closest cognitive neuroscience gets to a true test of necessity: remove the region and see what fails.',
      'fMRI can show a region is active during a task; only this approach (or TMS) can show the region is necessary for it.',
      'Damage to a region of the brain; studying patients with such damage is the oldest method for linking brain regions to functions.'],
    learn:'Damage to a circumscribed region of brain tissue (from stroke, injury, surgery, or deliberately in animals). Comparing what patients with a lesion can and cannot do reveals what the damaged region is necessary for; single and double dissociations formalize this logic.' },

  { id:'single_dissociation', answer:'Single dissociation', aliases:['single dissociations','dissociation'], cat:'lesion', unit:'L2', source:'Lecture 2 study guide',
    clues:[
      'Teuber gave the classic warning about it in 1955: it can be explained by one task simply being harder than the other.',
      'It has the form "patient A is impaired on task X but performs normally on task Y."',
      'It shows two abilities can come apart, but not that they depend on different brain systems.',
      'A double dissociation needs a second patient with the reverse pattern; this needs only one pattern.',
      'A pattern in which brain damage impairs one ability while leaving another intact, suggesting the two are at least partly independent.'],
    learn:'A finding that damage to a brain region impairs one function (task X) while sparing another (task Y). It suggests the functions are separable, but is open to the objection that X is simply harder than Y.' },

  { id:'double_dissociation', answer:'Double dissociation', aliases:['double dissociations'], cat:'lesion', unit:'L2', source:'Lecture 2 study guide',
    clues:[
      'Teuber\'s 1955 formulation is usually cited as its origin; Shallice later argued it is the strongest evidence neuropsychology can offer for separable modules.',
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
      'Its early components were once called "evoked potentials"; the name changed as researchers realized responses could be locked to internal events, not just stimuli.',
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
      'Its physics depends on antimatter: a positron meets an electron and the pair annihilates into two gamma rays flying in opposite directions.',
      'Its tracers decay so quickly (fluorine-18 has a half-life of about 110 minutes) that a cyclotron usually has to be nearby.',
      'It can image specific molecules, such as dopamine receptors or amyloid plaques, which MRI cannot.',
      'fMRI infers activity from blood oxygenation without injecting anything; this method requires a radioactive tracer.',
      'Imaging brain function or chemistry by injecting a radioactive tracer and detecting where in the brain it accumulates.'],
    learn:'Positron emission tomography: a radioactive tracer (e.g. labeled glucose or water, or a receptor ligand) is injected and its distribution imaged by detecting the gamma rays produced when emitted positrons annihilate. Measures blood flow, metabolism or neurochemistry; low temporal resolution and requires radiation.' },

  { id:'mri', answer:'MRI', aliases:['magnetic resonance imaging','structural MRI','structural mri scan','mri scan'], cat:'methods', unit:'L2', source:'Lecture 2 & 3 study guides', lab:'MRI_Explorer.html',
    clues:[
      'Its original name, nuclear magnetic resonance imaging, lost its first word because "nuclear" alarmed patients.',
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
      'It estimates a 3×3 matrix (a tensor) in every voxel, whose principal eigenvector gives the dominant direction of water motion.',
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
      'The word was coined by analogy with "pixel," with "vo-" standing for volume, and appears in the literature in the 1970s with early CT.',
      'In a typical fMRI scan it is 2–3 mm on a side and there are about 100,000 of them covering the brain.',
      'One measuring 3 mm on a side contains something on the order of a million neurons and billions of synapses.',
      'A pixel is a square element of a 2-D picture; this is the 3-D equivalent.',
      'The smallest unit of an MRI image: a tiny cube of brain tissue with a single measured value.'],
    learn:'A volume element: the 3-D equivalent of a pixel. Each voxel in an MRI or fMRI image is a small cube of tissue (typically 1–3 mm on a side) with one signal value. A 3 mm cubic voxel contains roughly a million neurons, so fMRI measures the pooled activity of very large populations.' },

  { id:'subtraction', answer:'Subtraction logic', aliases:['subtraction','subtraction method','cognitive subtraction','subtraction design','subtraction analysis','the subtraction method'], cat:'decoding', unit:'L3', source:'Lecture 3 study guide', lab:'Decoder_Playground.html',
    clues:[
      'It descends from Franciscus Donders\'s 1868 "subtractive method," which timed simple versus choice reactions to isolate mental stages.',
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
      'Poldrack\'s 2006 paper drew the distinction sharply, formalizing the two directions with Bayes\' rule.',
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
      'With k folds, each fold takes one turn as the test set and the k accuracies are averaged.',
      'Without it, a classifier can score 100% on data it has already seen, even when the labels are random.',
      'A single train/test split throws away test data for training; this rotates the split so every trial is tested exactly once.',
      'Training a decoder on some trials and testing it on held-out trials, repeated so that accuracy is measured only on data the decoder never saw.'],
    learn:'The procedure of measuring a decoder\'s accuracy only on trials it was not trained on, typically by dividing the data into folds and rotating which fold is held out. Prevents the classifier from getting credit for memorizing noise.' },

  { id:'classifier', answer:'Classifier', aliases:['decoder','support vector machine','svm','pattern classifier','linear classifier','classifiers'], cat:'decoding', unit:'L3', source:'Lecture 3 (decoding)', lab:'Decoder_Playground.html',
    clues:[
      'The support vector machine version was developed by Vapnik and colleagues in the 1990s and became the fMRI default because it copes with many voxels and few trials.',
      'Linear ones compute a weighted sum of voxel values and compare it with a threshold.',
      'Its accuracy is compared with chance, 50% for two conditions, usually with a permutation test.',
      'A subtraction map shows where activation differs; this is the algorithm that turns a pattern of activity into a prediction.',
      'In decoding, the algorithm trained to predict the experimental condition from a pattern of brain activity.'],
    learn:'An algorithm (e.g. a linear support vector machine) trained to predict a category label from a pattern of brain activity. In MVPA, its accuracy on held-out trials, compared with chance, measures how much information the pattern carries.' },
  ]
};
