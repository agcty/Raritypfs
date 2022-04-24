import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { Web3Storage } from "web3.storage";
import fetch from "node-fetch";
type LambdaHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;
import { create } from "ipfs-http-client";

const IPFS_API = "https://cloudflare-ipfs.com/";

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDFFRDVBRTVEYUJGRjlCQzVEOTUzQjRhNTdFRUUwYzI0MDYzMDdGNEYiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NTA3MTcxNzQ0NjQsIm5hbWUiOiJyYXJpdHlwZnMifQ.u15qnbxjsUTNLI11wPH8Nlhjymg8jGWZjvtcIXhp3LI";

const client = new Web3Storage({ token });

async function retrieveFiles() {
  const cid = "QmdJ8S7YfZmXQJYdieyHJhNpAUnqQ8KEQsgZ4EAdwYk7tx";
  const res = await client.get(cid);
  console.log(res);

  const files = await res.files();

  for (const file of files) {
    console.log(`${file.cid}: ${file.name} (${file.size} bytes)`);
  }
}

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

  return {
    statusCode: 200,
    body: JSON.stringify({ data: res }),
  };
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getLinks(ipfsPath) {
  const url = "https://cloudflare-ipfs.com/";
  const ipfs = create({ url });

  const links = [];
  for await (const link of ipfs.ls(ipfsPath)) {
    links.push(link);
  }
  console.log(links);
}
