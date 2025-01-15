import './App.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useContractRead } from 'wagmi';
import MultiSigWallet from './artifacts/contracts/MultiSigWallet.sol/MultiSigWallet.json';
import { Col, Container, ListGroup, ListGroupItem, Row } from 'react-bootstrap';

function App() {

  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

  //Fetch Owners of the Contract
  const { data: owners} = useContractRead({
    contractAddress: contractAddress,
    contractInterface: MultiSigWallet.abi,
    functionName: 'getOwners()',
    watch: true
  })

  return (
    <div className='container flex flex-col items-center mt-10'>
      <div className='flex-mb-6'>
        <ConnectButton />
      </div>

      <Container>
        <Row>
          <Col md='auto'>Owners:</Col>
          <Col>
            <ListGroup>
              {owners && owners.map((owner, i) => {
                return <ListGroupItem key={i}>{owner}</ListGroupItem>
              })}
            </ListGroup>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
