async function compare(tokenTraits) {
  console.log({ tokenTraits });
  // copy
  const newTraits = [...tokenTraits];

  for (const property of newTraits) {
    property.trait_rarity = collectionTraits[property.value];
  }
  return newTraits;
}

let averageRarityScore = 1;
let tokenTraitsPercent = [];

function averageRarity(tokenProperties) {
  //simple funct to calculate array mean
  function numAverage(a) {
    var b = a.length,
      c = 0,
      i;
    for (i = 0; i < b; i++) {
      c += Number(a[i]);
    }
    return c / b;
  }

  tokenProperties.forEach((element) => {
    tokenTraitsPercent.push(element.trait_rarity);
  });

  averageRarityScore = numAverage(tokenTraitsPercent);
  return averageRarityScore;
}

let rarestTraitFinal = [];


function rarestTraitCheck(traitsArray) {
  let rarestTrait = Math.min(...tokenTraitsPercent);

  for (let i = 0; i < traitsArray.length; i++) {
    if (rarestTrait == traitsArray[i].trait_rarity) {
      rarestTraitFinal.push(traitsArray[i]);
      return rarestTraitFinal;
    }
  }
}

let statisticalRarityScore = 1;

function statisticalRarity() {
  statisticalRarityScore = tokenTraitsPercent.reduce((a, b) => a * b, 1);
  return statisticalRarityScore;
}
