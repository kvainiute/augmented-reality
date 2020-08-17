var data = {
	meta: {
		//Change the name of the model
		name: "DNA",
		//Change the info of the model
		desc: "The augmented reality model shows a <em class='bolded'>DNA molecule</em>, which encodes genetic information. Although small, this molecule encodes all of our cognitive, motor, and other physiological and biochemical functions. A DNA molecule is made up of two intertwined strands called <em class='bolded'>complementary strands</em>. DNA molecules are present in all the nuclei of our cells. If stretched out, a single DNA molecule would be up to 2 meters in length. <em class='bolded'>The DNA code </em>is universal for all species, meaning that the chain contains the same 4 nitrogenous bases that make up the <em class='bolded'>amino acids</em>, whether the DNA is of an animal or plant. The same molecule but rearranged differently encodes all human genetic information and is passed down <em class='bolded'>from generation to generation.</em>",
	},
	model: {

		path: "DNA.glb", // <- enter the name of your model instead of 'DNA.glb'
		pattern: "ar",
		//Change the position of the model if it is off-center (use integers)
		pos: {
			x: 0,
			y: 0,
			z: 0
		},
		//Change the rotation of the model if needed (use integers)
		rot: {
			x: 0,
			y: 3 * Math.PI / 2,
			z: 0
		},
		//Change the size of the model if needed (use integers)
		scale: 0.15,
	}
}
