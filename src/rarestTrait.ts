export default function rarestTraitCheck(traitsArray) {
  let rarestTrait = Math.min(...tokenTraitsPercent);

  for (let i = 0; i < traitsArray.length; i++) {
    if (rarestTrait == traitsArray[i].trait_rarity) {
      rarestTraitFinal.push(traitsArray[i]);
      return rarestTraitFinal;
    }
  }
}
