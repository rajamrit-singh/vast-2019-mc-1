import { useEffect, useState } from "react";
import "./App.css";
import ScatterPlot from "./components/scatterplot/ScatterPlot";
import ParallelPlot from "./components/parallelplot/ParallelPlot";
import { getData } from "./utils/dataUtil";
import ChoroplethMap from './components/choropleth-map/ChoroplethMap';
import MultiLineChart from './components/multilinechart/MultiLineChart';
import HeatMap from './components/heatmap/HeatMap';
import DotPlot from './components/dotplot/DotPlot';
import LoadingPage from "./components/loading-page/LoadingPage";
import { Container, Navbar } from "react-bootstrap";

function App() {
  const [challengeData, setChallengeData] = useState([]);

  useEffect(() => {
    getData().then((d) => setChallengeData(d));
  }, []);

  if (challengeData?.length === 0) {
    return <LoadingPage />
  }
  return (
    <div className="App">
      <Navbar bg="primary" variant="dark" className="navbar-title justify-content-center"> 
        <Container className="container-nav">
          <Navbar.Brand><h1>Disaster Management Dashboard</h1></Navbar.Brand>
        </Container>
      </Navbar>
      <div className="multiline-container-div">
        <MultiLineChart data={challengeData} />
      </div>
      <div className="choropleth-dot-container-div">
        <ChoroplethMap data={challengeData} />
        <DotPlot data={challengeData} />
      </div>
      <div className="parallelplot-scatterplot-container-div">
        <ParallelPlot data={challengeData}></ParallelPlot>
        <ScatterPlot
          data={challengeData}
        ></ScatterPlot>
      </div>
      <div className="heatmap-container-div">
        <HeatMap data={challengeData} />
      </div>
      <div className="dotplot-container-div">
      </div>
    </div>
  );
}

export default App;
