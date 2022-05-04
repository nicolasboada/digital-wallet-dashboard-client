import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import { AiFillEdit, AiOutlineClose, AiOutlineCheck, AiOutlineReload, AiOutlineSearch} from 'react-icons/ai';
import { BASE_URL } from '../App';

const Header = ({setPinFavorites, setCurrency, editedExRate, setInputExRate,currency,exRateData,wallets,setWallets,fetchWalletData,inputExRate,setExRateData,setEditedExRate,fetchExchangeRates}) => {

const [showEdit, setShowEdit] = useState(false)
const [inputWallet, setInputWallet] = useState("")
const inputExRateRef = useRef("")

useEffect(() => {
    if (showEdit) {
    inputExRateRef.current.focus()}
  }, [showEdit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputWallet) return
    const isInWallets = wallets.find(({address}) => address === inputWallet)
    if (isInWallets) {
      alert("Wallet already exists")
      return
    }
    try {
      const newWalletData = await fetchWalletData(inputWallet)
      const newWallet = await axios.post(`${BASE_URL}/wallets`, newWalletData)
      setWallets([...wallets, newWallet.data])
      setInputWallet("")
    } catch (error) {
      console.log(error)
    }
  }
  
const handleEdit = (e) => {
    e.preventDefault()
    setExRateData({...exRateData, [currency]: inputExRate})
    setEditedExRate(true)
    setShowEdit(false)
  }
  

  return (
    <header className="App-header">
        <div className='header_top'>
          <div className='header_title'>
            Digital Wallet Dashboard
          </div>
          <form onSubmit={handleSubmit} className='header_form'>
            <input 
              value={inputWallet} 
              onChange={(e)=>setInputWallet(e.target.value)}
              placeholder="ETH Wallet Address"
              type="text"
              required
              pattern='^0x[a-fA-F0-9]{40}$'
              />
            <button type='submit'>
              <span >
                <AiOutlineSearch type='button'/>
              </span>
            </button>
          </form>
        </div>
        <div className='header_options'>
          <div className='header_options_left'>
            Ether Price: 
            <span> {currency === "USD" ? "$" : "€"} </span>
              {showEdit ?
                  <form onSubmit={handleEdit}>
                    <input ref={inputExRateRef} required pattern="^\d+(\.\d+)?$" value={inputExRate} onChange={(e)=>setInputExRate(e.target.value)} />
                    <AiOutlineCheck className='header_options_left_check_icon' type='submit' onClick={handleEdit}/>
                    <AiOutlineClose className='header_options_left_close_icon' type='button' onClick={()=>setShowEdit(false)}/>
                  </form>
                :
                <>
                <span>{exRateData[currency]}</span>
                <AiFillEdit className='header_options_left_edit_icon' onClick={()=>setShowEdit(true)}/>
                {editedExRate && <AiOutlineReload className='header_options_left_reload_icon' onClick={fetchExchangeRates}/>}
                </>
              }
          </div>
          <div className='header_options_right'>
            <div>
              <label htmlFor="">Select currency</label>
              <select name="currency" onChange={(e)=>setCurrency(e.target.value)}>
                <option value="USD" >USD</option>
                <option value="EUR" >EUR</option>
              </select>
            </div>
            <div>
              <label >Pin favorites</label>
              <input type="checkbox" onChange={(e) => setPinFavorites(e.target.checked)}/>
            </div>
          </div>
      </div>
    </header>
  )
}

export default Header