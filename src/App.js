import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useContract, useContractRead, useSigner } from 'wagmi';
import MultiSigWallet from './artifacts/contracts/MultiSigWallet.sol/MultiSigWallet.json';
import { Button, Col, Container, Form, FormControl, ListGroup, Row } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

function App() {

  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  const [scBalance, setScBalance] = useState(0)
  const [totalTxCount, setTotalTxCount] = useState(0)
  const [ethToUseForDeposit, setEthToUseForDeposit] = useState(0)
  const [ethToUseForWithdraw, setEthToUseForWithdraw] = useState(0)
  const [receiverAddress, setReceiverAddress] = useState(ethers.constants.AddressZero)

  //Fetch Owners of the Contract
  const { data: owners} = useContractRead({
    contractAddress: contractAddress,
    contractInterface: MultiSigWallet.abi,
    functionName: 'getOwners()',
    watch: true
  })

  //Get total no. of withdraw transactions
  const { data: withdrawTxnCount } = useContractRead({
    contractAddress: contractAddress,
    contractInterface: MultiSigWallet.abi,
    functionName: 'getWithdrawTxCount()',
    watch: true
  })

  //Get balance of smart contract
  const { data: contractBalance } = useContractRead({
    contractAddress: contractAddress,
    contractInterface: MultiSigWallet.abi,
    functionName: 'balanceOf()',
    watch: true
  })

  useEffect(() => {
    if (contractBalance) {
      let temp = contractBalance/ 10**18
      setScBalance(temp)
    }
    if (withdrawTxnCount) {
      setTotalTxCount(withdrawTxnCount)
    }
  }, [contractBalance, withdrawTxnCount])

  const {data: signer} = useSigner()
  const contract = useContract({
    addressOrName: contractAddress,
    contractInterface: MultiSigWallet.abi,
    signerOrProvider: signer
  })

  //Deposit eth to wallet  
  const depositToEtherWalletContract = async() => {
    await contract.deposit({
      value: ethers.utils.parseEther(ethToUseForDeposit)
    })
    setEthToUseForDeposit(0)
  }

  //Withdraw eth from contract/wallet
  const withdrawETHfromContract = async() => {
    await contract.createWithdrawTx(receiverAddress, ethers.utils.parseEther(ethToUseForWithdraw));
    setEthToUseForWithdraw(0)
    setReceiverAddress(ethers.constants.AddressZero)
  }

  return (
    <div className='container flex flex-col items-center mt-10'>
      <div className='flex-mb-6'>
        <ConnectButton />
      </div>

      <Container>
        <Row>
          <h3 className='text-5xl font-bold mb-20'>{'Multisig Wallet Info'}</h3>
        </Row>
        <Row>
          <Col md='auto'>Address of Contract:</Col>
          <Col>{contractAddress}</Col>
        </Row>
        <Row>
          <Col md='auto'>Owners:</Col>
          <Col>
            <ListGroup>
              {owners && owners.map((owner, i) => {
                return <ListGroup.Item key={i}>{owner}</ListGroup.Item>
              })}
            </ListGroup>
          </Col>
        </Row>
        <Row>
          <Col md='auto'>
              Total no. of Withdraw Transactions: 
          </Col>
          <Col>{totalTxCount}</Col>
        </Row>
        <Row>
          <Col md='auto'>
              Balance of Smart Contract:
          </Col>
          <Col>{scBalance}</Col>
        </Row>
      </Container>

      <Container>
        <Row>
          <h3 className='text-5xl font-bold mb-20'>
            {'Deposit to EtherWallet Smart Contract'}
          </h3>
        </Row>
        <Row>
          <Form>
            <Form.Group className='mb-3' controlID='numberInEth'>
              <FormControl type='text' placeholder='Amount in ETH'
                onChange={(e) => setEthToUseForDeposit(e.target.value)} 
              />
            </Form.Group>
            <Button variant='primary' 
              onClick={depositToEtherWalletContract} 
            >
              Deposit to Ether Wallet Smart Contract
            </Button>
          </Form>
        </Row>
      </Container>

      <Container>
        <Row>
          <h3 className='text-5xl font-bold mb-20'>
            {'Withdraw from EtherWallet Smart Contract'}
          </h3>
        </Row>
        <Row>
          <Form>
            <Form.Group className='mb-3' controlID='numberInEthtoWithdraw'>
              <FormControl type='text' placeholder='Amount in ETH'
                onChange={(e) => setEthToUseForWithdraw(e.target.value)} />
              <FormControl type='text' placeholder='Address to send to'
                onChange={(e) => setReceiverAddress(e.target.value)} />
            </Form.Group>
            <Button variant='primary' onClick={withdrawETHfromContract} >
              Withdraw money from Wallet
            </Button>
          </Form>
        </Row>
      </Container>
    </div>
  );
}

export default App;
