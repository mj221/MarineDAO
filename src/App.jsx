import { useAddress, useMetamask, useEditionDrop, useToken } from '@thirdweb-dev/react'
import { useState, useEffect, useMemo} from 'react'

const App = () => {
  const address = useAddress()
  const connectWithMetamask = useMetamask()
  console.log("Address:", address)

  const editionDrop = useEditionDrop("0x3E8e97c2cceB9C706443b100Ea613d06B530e09d")
  const token = useToken("0x36231BEd919240Ff34Fd9DB65ED6EDB841D6e654")
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

  // Holds the amount of token each member has in state.
  const [memberTokenAmounts, setMemberTokenAmounts] = useState([]);
  // The array holding all the members addresses.
  const [memberAddresses, setMemberAddresses] = useState([]);

  // Shorten members wallet addresses for visual ease
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // Grab the users who hold the membership NFT
    // with tokenId 0.
    const getAllAddresses = async () => {
      try {
        const memberAddresses = await editionDrop.history.getAllClaimerAddresses(0);
        setMemberAddresses(memberAddresses);
        console.log("Members addresses", memberAddresses);
      } catch (error) {
        console.error("failed to get member list", error);
      }

    };
    getAllAddresses();
  }, [hasClaimedNFT, editionDrop.history]);

  // Grabs the # of token each member holds.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    const getAllBalances = async () => {
      try {
        const amounts = await token.history.getAllHolderBalances();
        setMemberTokenAmounts(amounts);
        console.log("Amounts", amounts);
      } catch (error) {
        console.error("failed to get member balances", error);
      }
    };
    getAllBalances();
  }, [hasClaimedNFT, token.history]);

  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      // We're checking if we are finding the address in the memberTokenAmounts array.
      // If we are, we'll return the amount of token the user has.
      // Otherwise, return 0.

      const member = memberTokenAmounts?.find(({ holder }) => holder === address);

      return {
        address,
        tokenAmount: member?.balance.displayValue || "0",
      }
    });
  }, [memberAddresses, memberTokenAmounts]);



  useEffect(() =>{
    if(!address){
      return
    }
    const checkBalance = async () =>{
      try{
        const balance = await editionDrop.balanceOf(address, 0)
        if (balance.gt(0)){
          setHasClaimedNFT(true)
          console.log(`User ${address} has a membership NFT.`)
        }else{
          setHasClaimedNFT(false)
          console.log(`User ${address} does not have a membership NFT.`)
        }
      }catch (err){
        setHasClaimedNFT(false)
        console.error("Failed to get balance.", err)
      }
    }
    checkBalance()
  }, [address, editionDrop])

  const mintNft = async () =>{
    
    try {
      setIsClaiming(true)
      await editionDrop.claim("0", 1)
      console.log(`🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${editionDrop.getAddress()}/0`)
      setHasClaimedNFT(true)
    } catch (error) {
      setHasClaimedNFT(false)
      console.error("Failed to mint NFT", error)
    } finally {
      setIsClaiming(false)
    }
    
  }

  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to MelonDAO</h1>
        <button onClick={connectWithMetamask} className="btn-hero">
          Connect your wallet
        </button>
      </div>
    )
  }
  if (hasClaimedNFT){
    return (
      <div className="member-page">
        <h1> 🍉DAO Member Page</h1>
        <p> Welcome to MelonDAO, where melon is better with salt.</p>
        <div>
          <div>
            <h2>Member List</h2>
            <table className="card">
              <thead> 
                <tr>
                  <th>Address</th>
                  <th>MelonDAO Governance Token Amount</th>
                </tr>
              </thead>  
              <tbody>
                {memberList.map((member) =>{
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="mint-nft">
      <h1>Mint your free 🍉DAO Membership NFT</h1>
      <button
        disabled={isClaiming}
        onClick={mintNft}
      >
        {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
      </button>
    </div>
  )
}

export default App