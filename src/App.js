import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useContract, useContractRead, useSigner } from 'wagmi';
import MultiSigWallet from './artifacts/contracts/MultiSigWallet.sol/MultiSigWallet.json';
import { Button, Col, Container, Form, FormControl, ListGroup, Row, Table } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

function App() {

  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  const [scBalance, setScBalance] = useState(0)
  const [scTotalTxCount, setScTotalTxCount] = useState(0)
  const [ethToUseForDeposit, setEthToUseForDeposit] = useState(0)
  const [ethToUseForWithdraw, setEthToUseForWithdraw] = useState(0)
  const [receiverAddress, setReceiverAddress] = useState(ethers.constants.AddressZero)
  const [scPendingTx, setScPendingTx] = useState([])

  //Fetch Owners of the Contract
  const { data: owners} = useContractRead({
    addressOrName: contractAddress,
    contractInterface: MultiSigWallet.abi,
    functionName: 'getOwners',
    watch: true
  })

  //Get total no. of withdraw transactions
  const { data: withdrawTxnCount } = useContractRead({
    contractAddress: contractAddress,
    contractInterface: MultiSigWallet.abi,
    functionName: 'getWithdrawTxCount',
    watch: true
  })

  //Get balance of smart contract
  const { data: contractBalance } = useContractRead({
    contractAddress: contractAddress,
    contractInterface: MultiSigWallet.abi,
    functionName: 'balanceOf',
    watch: true
  })

  //Fetch all withdraw txns
  const { data: withdrawTxns } = useContractRead({
    contractAddress: contractAddress,
    contractInterface: MultiSigWallet.abi,
    functionName: 'getWithdrawTxes',
    watch: true
  })

  useEffect(() => {
    if (contractBalance) {
      let temp = contractBalance/ 10**18
      setScBalance(temp)
    }
    if (withdrawTxnCount) {
      setScTotalTxCount(withdrawTxnCount)
    }
    if (withdrawTxns) {
      let pendingTxns = []
      for(let i=0; i< withdrawTxns.length; i++) {
        if (!withdrawTxns[i][3]){
          pendingTxns.push({
            transactionIndex: i,
            to: withdrawTxns[i][0],
            amount: parseInt(ethers.utils.formatEther(withdrawTxns[i][1])),
            approvals: withdrawTxns[i][2].toNumber()})
        }
      }
      setScPendingTx(pendingTxns);
    }
  }, [contractBalance, withdrawTxnCount, withdrawTxns])

  const {data: signer} = useSigner()
  const contract = useContract({
    addressOrName: contractAddress,
    contractInterface: MultiSigWallet.abi,
    signerOrProvider: signer
  })

  //Deposit eth to wallet  
  const depositToEtherWalletContract = async() => {
    try {
      await contract.deposit({
        value: ethers.utils.parseEther(ethToUseForDeposit)
      })
    } catch(e){
      console.log('Divya: ',e)
    }
    
    setEthToUseForDeposit(0)
  }

  //Withdraw eth from contract/wallet
  const withdrawETHfromContract = async() => {
    await contract.createWithdrawTx(receiverAddress, ethers.utils.parseEther(ethToUseForWithdraw));
    setEthToUseForWithdraw(0)
    setReceiverAddress(ethers.constants.AddressZero)
  }

  //Approve pending Tx
  const approvePendingTransaction = async(txnId) => {
    await contract.approveWithdrawTx(txnId)
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
          <Col>{scTotalTxCount}</Col>
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

      <Container>
      <Row>
          <h3 className='text-5xl font-bold mb-20'>
            {'Pending Withdraw Transactions'}
          </h3>
        </Row>
        <Row>
          <Table striped hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Receiver</th>
                <th>Amount</th>
                <th>Number of Approvals</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {scPendingTx.map((tx, i) => {
                return (
                  <tr key={i}>
                    <td>{i}</td>
                    <td>{tx.to}</td>
                    <td>{tx.amount} ETH</td>
                    <td>{tx.approvals}</td>
                    <td>
                      <Button
                        variant='success'
                        onClick={() =>
                          approvePendingTransaction(tx.transactionIndex)
                        }
                      >
                        Approve
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </Row>
      </Container>
    </div>
  );
}

export default App;