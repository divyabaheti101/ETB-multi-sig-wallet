import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useContractRead } from 'wagmi';
import MultiSigWallet from './artifacts/contracts/MultiSigWallet.sol/MultiSigWallet.json';
import { Col, Container, ListGroup, Row } from 'react-bootstrap';
import { useEffect, useState } from 'react';

function App() {

  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  const [scBalance, setScBalance] = useState(0)
  const [totalTxCount, setTotalTxCount] = useState(0)

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
    </div>
  );
}

export default App;
