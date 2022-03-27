import { 
  useAddress, 
  useMetamask, 
  useEditionDrop, 
  useToken, 
  useVote,
  useNetwork
} from '@thirdweb-dev/react'

import { ChainId } from '@thirdweb-dev/sdk'
import { useState, useEffect, useMemo} from 'react'
import { AddressZero } from "@ethersproject/constants"

const App = () => {
  const address = useAddress()
  const network = useNetwork()
  const connectWithMetamask = useMetamask()
  console.log("Address:", address)

  const editionDrop = useEditionDrop("0x3E8e97c2cceB9C706443b100Ea613d06B530e09d")
  const token = useToken("0x36231BEd919240Ff34Fd9DB65ED6EDB841D6e654")
  const vote = useVote("0x895aa4dA0dA442E358C21FB753445BAc959fc723")
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

  // Holds the amount of token each member has in state.
  const [memberTokenAmounts, setMemberTokenAmounts] = useState([])
  // The array holding all the members addresses.
  const [memberAddresses, setMemberAddresses] = useState([])

  // Shorten members wallet addresses for visual ease
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4)
  }

  const [proposals, setProposals] = useState([])
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)

  // Retrieve all existing proposals from the contract
  useEffect(() => {
    if (!hasClaimedNFT){
      return
    }

    const getAllProposals = async ()=>{
      try{
        const proposals = await vote.getAll()
        setProposals(proposals)
        console.log(proposals)
      }catch(error){
        console.log("failed to get proposals", error)
      }
    }
    getAllProposals()

  }, [hasClaimedNFT, vote])

  // Need to check if the user has already voted
  useEffect(() =>{
    if(!hasClaimedNFT){
      return
    }
    if (!proposals.length){
      return
    }
    const checkIfUserHasVoted = async()=>{
      try{
        const hasVoted = await vote.hasVoted(proposals[0].proposalId, address)
        setHasVoted(hasVoted)
        if(hasVoted){
          console.log("User has already voted")
        }else{
          console.log("User has not yet voted")
        }
      }catch(error){
        console.log("Failed to check if wallet has voted", error)
      }
    }
    checkIfUserHasVoted()
  }, [hasClaimedNFT, proposals, address, vote])

  useEffect(() => {
    if (!hasClaimedNFT) {
      return
    }

    // Grab the users who hold the membership NFT
    // with tokenId 0.
    const getAllAddresses = async () => {
      try {
        const memberAddresses = await editionDrop.history.getAllClaimerAddresses(0)
        setMemberAddresses(memberAddresses)
        console.log("Members addresses", memberAddresses)
      } catch (error) {
        console.error("failed to get member list", error)
      }

    }
    getAllAddresses()
  }, [hasClaimedNFT, editionDrop.history])

  // Grabs the # of token each member holds.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return
    }

    const getAllBalances = async () => {
      try {
        const amounts = await token.history.getAllHolderBalances()
        setMemberTokenAmounts(amounts)
        console.log("Amounts", amounts)
      } catch (error) {
        console.error("failed to get member balances", error)
      }
    }
    getAllBalances()
  }, [hasClaimedNFT, token.history])

  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      // We're checking if we are finding the address in the memberTokenAmounts array.
      // If we are, we'll return the amount of token the user has.
      // Otherwise, return 0.

      const member = memberTokenAmounts?.find(({ holder }) => holder === address)

      return {
        address,
        tokenAmount: member?.balance.displayValue || "0",
      }
    })
  }, [memberAddresses, memberTokenAmounts])



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
      window.alert(`Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${editionDrop.getAddress()}/0`)
      setHasClaimedNFT(true)
    } catch (error) {
      setHasClaimedNFT(false)
      console.error("Failed to mint NFT", error)
    } finally {
      setIsClaiming(false)
    }
    
  }
  
  if(network?.[0].data.chain && network?.[0].data.chain.id !== ChainId.Rinkeby){
    return (
      <div className="unsupported-network">
        <h2>
          Please connect to Rinkeby testnet
        </h2>
        <p>
          MelonDAO is currently deployed on the Rinkeby network. Please switch networks from your wallet.
        </p>
      </div>
    )
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
          <div>
            <h2>Active Proposals</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                e.stopPropagation()

                setIsVoting(true)

                const votes = proposals.map(proposal =>{
                  let voteResult = {
                    proposalId: proposal.proposalId,
                    // abstain by default
                    vote: 2, 
                  }
                  proposal.votes.forEach((vote) =>{
                    const elem = document.getElementById(
                      proposal.proposalId + "-" + vote.type
                    )
                    if(elem.checked){
                      voteResult.vote  = vote.type
                      return
                    }
                  })
                  return voteResult
                })

                try{
                  // check if wallet still needs to delegate their token before voting
                  const delegation = await token.getDelegationOf(address)
                  // if delegation is the 0x0 address, the user has not delegated yet
                  if(delegation === AddressZero){
                    await token.delegateTo(address)
                  }

                  // vote on the proposals
                  try{
                    await Promise.all(
                      votes.map(async({proposalId, vote: _vote}) => {
                        // check if proposal is open for voting. 
                        // Get latest state of the proposal
                        const proposal = await vote.get(proposalId)
                        if (proposal.state === 1){
                          // proposal is still open if the state is 1
                          return vote.vote(proposalId, _vote)
                        }
                        return
                      })
                    )
                    // If any proposal is ready to be executed, they need to be executed
                    // Ready proposals are in state 4
                    try{
                      await Promise.all(
                        votes.map(async ({ proposalId }) => {
                          const proposal = await vote.get(proposalId)

                          if(proposal.state === 4){
                            return vote.execute(proposalId)
                          }
                        })
                      )
                      setHasVoted(true)
                      console.log("Successfully voted")
                    }catch(error){
                      console.error("failed to execute votes", error)
                    }

                  }catch(error){
                    console.error("failed to vote", error)
                  }
                } catch (error){
                  console.error("failed to delegate tokens")
                } finally{
                  setIsVoting(false)
                }
              }}
            >
              {/*--------------*/}
              {proposals.map((proposal) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map(({ type, label }) => (
                      <div key={type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + type}
                          name={proposal.proposalId}
                          value={type}
                          //default the "abstain" vote to checked
                          defaultChecked={type === 2}
                        />
                        <label htmlFor={proposal.proposalId + "-" + type}>
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? "Voting..."
                  : hasVoted
                    ? "You Already Voted"
                    : "Submit Votes"}
              </button>
              {!hasVoted && (
                <small>
                  This will trigger multiple transactions that you will need to
                  sign.
                </small>
              )}
              {/*---------------*/}
            </form>
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