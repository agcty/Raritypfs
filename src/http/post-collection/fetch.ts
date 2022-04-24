//let baseURI = [{"inputs":[],"name":"baseURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}]
async function fetchToken(id) {
    try {
      const res = await fetch(
        `https://cloudflare-ipfs.com/ipfs/QmdJ8S7YfZmXQJYdieyHJhNpAUnqQ8KEQsgZ4EAdwYk7tx/${id}`
      );
      const data = await res.json();
      return data;
    } catch (error) {
      return null;
    }
  }
  
  export const handler = async () => {
    const promiseList = [];
  
    // little complicated to bypass rate limits
    // fetch 100 at a time, sleep for 2 seconds, then fetch the next 100, 3 times in total
    for (let x = 1; x < 3; x++) {
      const tmpList = [];
  
      for (let i = x * 100; i < x * 100 + 100; i++) {
        console.log(i);
        tmpList.push(fetchToken(i));
      }
  
      promiseList.push(...tmpList);
      console.log(tmpList);
      sleep(2000);
    }
  
    const res = await Promise.all(promiseList);
  
    console.log("res", res);
  
    return res;
  };
  
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
  //supply need to be based on ipfs folder files number
  const supply = 5555;
  const id = 133;
  const fullToken = [];
  
  let collectionTraits = {};
  //traitsListing() is looping onver an entire folder, based on supply.
  async function traitsListing() {
    let traitsTypes = []; // ie "background"
    let traitsValue = []; // ie "awesome background"
  
    //loop begins
    for (let i = 1; i <= supply; i++) {
      //to do: replace fs per fetch
      let rawdata = await fs.readFileSync(`./json/${i}.json`);
      //if the token exist, parse its attributes and push them to traitsTypes & traitsValue arrays
      if (rawdata) {
        let mdata = JSON.parse(rawdata);
        mdata.attributes.forEach((element) => {
          traitsTypes.push(element.trait_type);
          traitsValue.push(element.value);
        });
      }
    }
  
    //turning array into a map
    const map = traitsValue.reduce(
      (acc, e) => acc.set(e, (acc.get(e) || 0) + 1),
      new Map()
    );
  
    //sorting traits per vlaue
    const uniqueTraitsValues = Array.from(map.entries());
    uniqueTraitsValues.sort(function (a, b) {
      return a[1] - b[1];
    });
  
    //creating an object for the entire collection using traits as Keys and rarity % as value
    uniqueTraitsValues.forEach((element) => {
      collectionTraits[`${element[0]}`] = ((100 * element[1]) / supply).toFixed(
        2
      );
    });
    return collectionTraits;
  }
  
  let tokenTraits = {};
  let fullTokenTraits = [];
  
  //checkToken is parsing a token traits
  async function checkToken(id) {
    let rawdata = await fs.readFileSync(`./json/${id}.json`);
    //if the token exist, parse its attributes and push them to traitsTypes & traitsValue arrays
    if (rawdata) {
      let mdata = JSON.parse(rawdata);
      mdata.attributes.forEach((element) => {
        tokenTraits[element.trait_type] = element.value;
      });
      fullTokenTraits.push(tokenTraits);
    }
    return await fullTokenTraits;
  }
  
  //tokenProperties will contain the traits values as keys and their rarity % according to collectionTraits value
  
  let traitsArray = [];
  
  async function compare(tokenTraits) {
    for (const property in tokenTraits) {
      //for each trait the token has, we compare it to our collectionTraits
      //none are excluded to make things easier
  
      if (tokenTraits[property] != "None") {
        let tokenProperties = {};
        tokenProperties.trait_type = property;
        tokenProperties.trait_value = tokenTraits[property];
        tokenProperties.trait_rarity = collectionTraits[tokenTraits[property]];
        traitsArray.push(tokenProperties);
      }
    }
    return traitsArray;
  }
  
  let averageRarityScore = 1;
  let tokenTraitsPercent = [];
  async function averageRarity(tokenProperties) {
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
  async function rarestTraitCheck(traitsArray) {
    rarestTrait = Math.min(...tokenTraitsPercent);
  
    for (let i = 0; i < traitsArray.length; i++) {
      if (rarestTrait == traitsArray[i].trait_rarity) {
        rarestTraitFinal.push(traitsArray[i]);
        return rarestTraitFinal;
      }
    }
  }
  
  let statisticalRarityScore = 1;
  async function statisticalRarity() {
    statisticalRarityScore = tokenTraitsPercent.reduce((a, b) => a * b, 1);
    return statisticalRarityScore;
  }
  
  async function main() {
    await traitsListing();
    await checkToken(id);
  
    await compare(tokenTraits);
  
    await averageRarity(traitsArray);
  
    await rarestTraitCheck(traitsArray);
  
    await statisticalRarity();
  
    let tokenInfo = {
      attributes: traitsArray,
      ARS: averageRarityScore,
      SRS: statisticalRarityScore,
      rarestTrait: rarestTraitFinal[0],
    };
  
    console.log(`Token ${id}`, tokenInfo);
  }
  
  main();
  