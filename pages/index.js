import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { newKitFromWeb3 } from "@celo/contractkit";
import Web3 from "web3";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";
import mecanoAdvertiserAbi from "../contracts/MecanoAdvertiser.abi.json";
import { contractAddress, cUSDContractAddress } from "../utils/constants";

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState("");

  const [message, setMessage] = useState("");

  const [name, setName] = useState("");

  /*
   * All state property to store the campaign data.
   */
  const [allCampaign, setallCampaign] = useState([]);

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      /*
       * Check if we're authorized to access the user's wallet
       */
      const { celo } = window;

      const web3 = new Web3(celo);

      const kit = newKitFromWeb3(web3);

      const accounts = await kit.web3.eth.getAccounts();

      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        toast.success("🦄 Wallet is Connected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        getAllads();
      } else {
        toast.warn("Make sure you have Celo Extension wallet Connected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      toast.error(`${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  /**
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { celo } = window;

      if (!celo) {
        toast.warn("Make sure you have the Celo Extension Wallet Connected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return;
      }
      const web3 = new Web3(celo);

      await celo.enable();

      const kit = newKitFromWeb3(web3);

      const accounts = await kit.web3.eth.getAccounts();

      kit.defaultAccount = accounts[0];
      setCurrentAccount(accounts[0]);
      getAllads();
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * Create a method that gets all campaign from your contract
   */
  const getAllads = async () => {
    try {
      const { celo } = window;

      if (celo) {
        const web3 = new Web3(celo);

        const kit = newKitFromWeb3(web3);

        const campaignPortalContract = new kit.web3.eth.Contract(
          mecanoAdvertiserAbi,
          contractAddress
        );

        /*
         * Call the getAllads method from your Smart Contract
         */
        const campaigns = await campaignPortalContract.methods
          .getAllads()
          .call();
        /*
         * We only need address, timestamp, name, and message in our UI so let's
         * pick those out
         */
        const campaignCleaned = campaigns.map((campaign) => {
          return {
            address: campaign.giver,
            timestamp: new Date(campaign.timestamp * 1000),
            message: campaign.message,
            name: campaign.name
          };
        });

        /*
         * Store our data in React State
         */
        setallCampaign(campaignCleaned);
      } else {
        console.log("Celo object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  async function fundCampaign() {
    try {
    const { celo } = window;
    if (celo){
    const web3 = new Web3(celo);

    const kit = newKitFromWeb3(web3);
    const aContract = new kit.web3.eth.Contract(
          mecanoAdvertiserAbi,
          contractAddress
        );
    let campaignPrice = await aContract.methods
          .getCampaignPrice()
          .call();
    const result = await aContract.methods
      .fundCampaign()
      .send({
          from : currentAccount,
          value: campaignPrice
      });
    return result;
  }
  } catch (error) {
          toast.error(`${error.message}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
  }

  const buycampaign = async () => {
    try {
      const { celo } = window;

      if (celo) {
        const web3 = new Web3(celo);

        const kit = newKitFromWeb3(web3);

        const campaignPortalContract = new kit.web3.eth.Contract(
          mecanoAdvertiserAbi,
          contractAddress
        );

        let count = await campaignPortalContract.methods.getTotalCampaigners().call();

        let campaignPrice = await campaignPortalContract.methods
          .getCampaignPrice()
          .call();


        /*
         * Execute the actual campaign from your smart contract
         */
        toast.info("Awaiting payment approval...", {
          position: "top-left",
          autoClose: 18050,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        try {
          await fundCampaign();
        } catch (error) {
          toast.error(`${error.message}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }

        try {
          toast.info("Sending Fund for campaign...", {
            position: "top-left",
            autoClose: 18050,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });

          const campaignTxn = await campaignPortalContract.methods
            .launchCampaign(
              message ? message : "Enjoy Your campaign",
              name ? name : "Anonymous"
            )
            .send({from: currentAccount});

        } catch (error) {
          toast.error(`${error.message}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }

        count = await campaignPortalContract.methods.getTotalCampaigners().call();


        setMessage("");

        setName("");

        toast.success("campaign Purchased!", {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        getAllads();
      } else {
        console.log("Celo object doesn't exist!");
      }
    } catch (error) {
      toast.error(`${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.log(error);
    }
  };

  const handleOnMessageChange = (event) => {
    const { value } = event.target;
    setMessage(value);
  };
  const handleOnNameChange = (event) => {
    const { value } = event.target;
    setName(value);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Launch your Ads Campaign Today</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold text-blue-600 mb-6">
          Launch your Ads Campaign
        </h1>

        {/*
         * If there is currentAccount render this form, else render a button to connect wallet
         */}

        {currentAccount ? (
          <div className="w-full max-w-xs sticky top-3 z-50 ">
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="name"
                >
                  BrandName
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  type="text"
                  placeholder="Brand Name"
                  onChange={handleOnNameChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="message"
                >
                  write a brief description.
                </label>

                <textarea
                  className="form-textarea mt-1 block w-full shadow appearance-none py-2 px-3 border rounded text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                  placeholder="Product Description"
                  id="message"
                  onChange={handleOnMessageChange}
                  required
                ></textarea>
              </div>

              <div className="flex items-left justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-center text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={buycampaign}
                >
                  Launch $1 cUSD
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <p className="text-2xl text-blue-600 mb-6">
              Switch your wallet to Alfajores Testnet to test this application.
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-full mt-3"
              onClick={connectWallet}
            >
              Connect Your Wallet
            </button>
          </div>
        )}

        {allCampaign.map((campaign, index) => {
          return (
            <div className="border-l-2 mt-10" key={index}>
              <div className="transform transition cursor-pointer hover:-translate-y-2 ml-10 relative flex items-center px-6 py-4 bg-blue-800 text-white rounded mb-10 flex-col md:flex-row space-y-4 md:space-y-0">
                {/* <!-- Dot Following the Left Vertical Line --> */}
                <div className="w-5 h-5 bg-blue-600 absolute -left-10 transform -translate-x-2/4 rounded-full z-10 mt-2 md:mt-0"></div>

                {/* <!-- Line that connecting the box with the vertical line --> */}
                <div className="w-10 h-1 bg-green-300 absolute -left-10 z-0"></div>

                {/* <!-- Content that showing in the box --> */}
                <div className="flex-auto">
                  <h1 className="text-md">ProductName: {campaign.name}</h1>
                  <h1 className="text-md">ProductDescription: {campaign.message}</h1>
                  <h3>Address: {campaign.address}</h3>
                  <h1 className="text-md font-bold">
                    TimeStamp: {campaign.timestamp.toString()}
                  </h1>
                </div>
              </div>
            </div>
          );
        })}
      </main>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}