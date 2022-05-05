import "./App.css";
import axios from "axios";
import { useEffect, useState } from "react";
import Header from "./Components/Header";
import Wallet from "./Components/Wallet";

export const BASE_URL = import.meta.env.VITE_BASE_URL;

function App() {
  const [currency, setCurrency] = useState("USD");
  const [editedExRate, setEditedExRate] = useState(false);
  const [exRateData, setExRateData] = useState({});
  const [inputExRate, setInputExRate] = useState(exRateData[currency]);
  const [wallets, setWallets] = useState([]);
  const [sortedWallets, setSortedWallets] = useState(wallets);
  const [pinFavorites, setPinFavorites] = useState(false);
  const [userId, setUserId] = useState("");

  const fetchExchangeRates = async () => {
    const response = await fetch(
      "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD,EUR"
    );
    const data = await response.json();
    setExRateData(data);
    setEditedExRate(false);
  };

  useEffect(() => {
    fetchExchangeRates();
    const userIdLocalStorage = localStorage.getItem("userId");
    if (userIdLocalStorage) {
      setUserId(userIdLocalStorage);
    } else {
      const newUserId = Math.floor(Math.random() * 10000000000).toString();
      localStorage.setItem("userId", newUserId);
      setUserId(newUserId);
    }
  }, []);

  useEffect(() => {
    setInputExRate(exRateData[currency]);
  }, [currency, exRateData]);

  useEffect(() => {
    async function fetchData() {
      if (userId.length > 0) {
        // fecth wallets data from db
        const res = await fetch(`${BASE_URL}/wallets/user/${userId}`);
        const data = await res.json();
        setWallets(data);
        // fetch current data from 3rd party API
        const updatedWalletsData = await Promise.all(
          data.map(async (wallet) => {
            return await fetchWalletData(wallet.address);
          })
        );
        // update the wallets array with the current data
        const updatedWallets = await Promise.all(
          updatedWalletsData.map(async (wallet) => {
            const id = await data.find((w) => w.address === wallet.address)._id;
            const { isFavorite, isOld, ...updatedwallet } = wallet;
            const res = await axios.put(`${BASE_URL}/wallets/${id}`, {
              ...updatedwallet,
              _id: id,
            });
            return res.data;
          })
        );
        setWallets(updatedWallets);
      }
    }
    fetchData();
  }, [userId]);

  useEffect(() => {
    if (pinFavorites) {
      const sortedArray = [
        ...wallets.filter(({ isFavorite }) => isFavorite),
        ...wallets.filter(({ isFavorite }) => !isFavorite),
      ];
      setSortedWallets(sortedArray);
    } else {
      setSortedWallets(wallets);
    }
  }, [pinFavorites, wallets]);

  const isOld = (timestamp) => {
    if (timestamp * 1000 < Date.now() - 1000 * 60 * 60 * 24 * 365) {
      return true;
    } else {
      return false;
    }
  };

  const fetchWalletData = async (address) => {
    try {
      const ApiKeyToken = import.meta.env.VITE_API_KEY_TOKEN;
      const result = await Promise.allSettled([
        fetch(
          `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${ApiKeyToken}`
        ).then((res) => res.json()),
        fetch(
          `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=1&sort=asc&apikey=${ApiKeyToken}`
        ).then((res) => res.json()),
      ]);
      if (result[0].value.status === "0") {
        throw new Error("Wallet not found");
      }
      const walletBalance = result[0].value.result / Math.pow(10, 18);
      const timestamp = result[1].value.result[0]?.timeStamp;

      return {
        address: address,
        balance: +walletBalance,
        isFavorite: false,
        isOld: isOld(timestamp),
        userId: userId,
      };
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="App">
      <Header
        currency={currency}
        exRateData={exRateData}
        editedExRate={editedExRate}
        wallets={wallets}
        inputExRate={inputExRate}
        setCurrency={setCurrency}
        setInputExRate={setInputExRate}
        setPinFavorites={setPinFavorites}
        setWallets={setWallets}
        fetchWalletData={fetchWalletData}
        setExRateData={setExRateData}
        setEditedExRate={setEditedExRate}
        fetchExchangeRates={fetchExchangeRates}
      />
      <main>
        {sortedWallets.map((wallet) => (
          <Wallet
            key={wallet.address}
            wallet={wallet}
            wallets={wallets}
            currency={currency}
            exRateData={exRateData}
            setWallets={setWallets}
          />
        ))}
      </main>
    </div>
  );
}

export default App;
