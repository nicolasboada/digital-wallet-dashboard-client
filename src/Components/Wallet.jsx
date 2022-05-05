import axios from "axios";
import React from "react";
import {
  AiFillStar,
  AiOutlineClose,
  AiOutlineInfoCircle,
  AiOutlineStar,
} from "react-icons/ai";
import { BASE_URL } from "../App";

const Wallet = ({ wallet, currency, exRateData, wallets, setWallets }) => {
  const toggleFav = async (id) => {
    try {
      const selectedWallet = wallets.find((wallet) => wallet._id === id);
      const updatedWallet = {
        ...selectedWallet,
        isFavorite: !selectedWallet.isFavorite,
      };
      await axios.put(`${BASE_URL}/wallets/${id}`, updatedWallet);
      setWallets(
        wallets.map((wallet) =>
          wallet._id === id
            ? { ...wallet, isFavorite: !wallet.isFavorite }
            : wallet
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/wallets/${id}`);
      setWallets(wallets.filter((wallet) => wallet._id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="wallet_card">
      <div className="wallet_card_header">
        <div>
          Address <span>{wallet.address}</span>
        </div>
        <div>
          {wallet.isFavorite ? (
            <AiFillStar
              className="wallet_card_header_fillStar_icon"
              onClick={() => toggleFav(wallet._id)}
            />
          ) : (
            <AiOutlineStar
              className="wallet_card_header_outlineStar_icon"
              onClick={() => toggleFav(wallet._id)}
            />
          )}
          <AiOutlineClose
            className="wallet_card_header_close_icon"
            onClick={() => handleDelete(wallet._id)}
          />
        </div>
      </div>
      <div className="wallet_card_row">
        <span>Balance: </span>
        <span>{wallet.balance} Ether</span>
      </div>
      <div className="wallet_card_row">
        <span>Value: </span>
        <span>{currency === "USD" ? "$" : "€"} </span>
        <span>{(wallet.balance * exRateData[currency]).toFixed(2)}</span>
        <span className="wallet_card_small">
          {" "}
          (@ {currency === "USD" ? "$" : "€"}
          {exRateData[currency]}/ETH)
        </span>
      </div>
      {wallet.isOld && (
        <>
          <div className="wallet_card_row">
            <div className="wallet_card_info_old">
              <AiOutlineInfoCircle /> wallet is old!
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Wallet;
