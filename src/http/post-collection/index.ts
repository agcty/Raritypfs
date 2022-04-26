import type {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import fetch from "node-fetch";
type LambdaHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;
import { create } from "ipfs-http-client";
import rarestTraitCheck from "../../rarestTrait";

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

export const handler: LambdaHandler = async (event, context) => {
  const promiseList = [];

  for (let x = 1; x < 3; x++) {
    const tmpList = [];

    for (let i = x * 20; i < x * 20 + 20; i++) {
      tmpList.push(fetchToken(i));
    }

    promiseList.push(...tmpList);
    sleep(2000);
  }

  const res = await Promise.all(promiseList);

  const traits = await traitsListing(res);
  console.log(traits);

  // compare token #1
  const token1 = await compare(res[0].attributes);

  console.log(token1);

  const averageRar = averageRarity(res[0].attributes);

  console.log({ averageRar });

  const rarestTrait = rarestTraitCheck(res[0].attributes);
  console.log({ rarestTrait });

  const statRar = statisticalRarity();
  console.log({ statRar });

  return {
    statusCode: 200,
    body: JSON.stringify({ data: traits }),
  };
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
async function traitsListing(tokenTraits) {
  let traitsTypes = []; // ie "background"
  let traitsValue = []; // ie "awesome background"

  //to do: replace fs per fetch
  tokenTraits.forEach((trait) =>
    trait.attributes.forEach((element) => {
      traitsTypes.push(element.trait_type);
      traitsValue.push(element.value);
    })
  );

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

let statisticalRarityScore = 1;

function statisticalRarity() {
  statisticalRarityScore = tokenTraitsPercent.reduce((a, b) => a * b, 1);
  return statisticalRarityScore;
}
