import React from 'react';
import debounce from 'debounce';
import {csv, json} from 'd3-fetch';
import {
  XYPlot,
  LabelSeries,
  XAxis,
  YAxis,
  MarkSeries,
  ArcSeries,
  Voronoi,
  LineSeries,
  Hint
} from 'react-vis';
import Slider from 'react-rangeslider';
import {
  getDomain,
  getCircleCoordinatesQuickly,
  getGuidelineData,
  getRadialAxesData,
  nodeMap
} from '../utils';
import {scaleLinear} from 'd3-scale';
import Option from 'muicss/lib/react/option';
import Select from 'muicss/lib/react/select';
import GoChevronLeft from 'react-icons/lib/go/chevron-left';
import GoChevronRight from 'react-icons/lib/go/chevron-right';

// import MapComponent from './map-component';

class RootComponent extends React.Component {
  componentWillMount() {
    // if the data you are going to import is small, then you can import it using es6 import
    // import MY_DATA from './data/example.json'
    // (I tend to think it's best to use screaming snake case for imported json)
    this.debouncedSetState = debounce(newState => this.setState(newState), 15);
    this.shorterDebouncedSetState = debounce(newState => this.setState(newState), 10);

    this.setState({
      data: {},
      pcs: {},
      loadingData: true,
      loadingNumbersData: true,
      loadingNumbersPcs: true,
      loadingGenderData: true,
      loadingGenderPcs: true,
      loadingPluralsData: true,
      loadingPluralsPcs: true,
      loadingTenseData: true,
      loadingTensePcs: true,
      dataProcessed: null,
      hoveringOver: null,
      clickedOn: {},
      checked: {},
      whichDataset: 'plurals',
      titles: {
        tense: 'Which way is the present?',
        plurals: 'Which way is singular?',
        gender: 'Which way is feminine?',
        numbers: 'Which way is negative?'
      },
      legend: {
        tense: {origin: 'past tense', marks: 'present tense'},
        plurals: {origin: 'plural', marks: 'singular'},
        gender: {origin: 'masculine', marks: 'feminine'},
        numbers: {origin: 'positive', marks: 'negative'}
      },
      fontSizes: {
        title: 36,
        h1: 24,
        h2: 20,
        h3: 16,
        normal: 12,
        small: 10
      }
    });

    json('data/numbersp2.json')
      .then(d => {
        const dataCopy = this.state.data;
        dataCopy.numbers = d;
        this.setState({
          loadingNumbersData: false
        });
      });

    csv('data/numbers_pcs.csv')
      .then(data => {
        const pcsCopy = this.state.pcs;
        pcsCopy.numbers = data;
        this.setState({
          loadingNumbersPcs: false
        });
      });

    json('data/genderp2.json')
      .then(d => {
        const dataCopy = this.state.data;
        dataCopy.gender = d;
        this.setState({
          loadingGenderData: false
        });
      });

    csv('data/gender_pcs.csv')
      .then(data => {
        const pcsCopy = this.state.pcs;
        pcsCopy.gender = data;
        this.setState({
          loadingGenderPcs: false
        });
      });

    json('data/pluralsp2.json')
      .then(d => {
        const dataCopy = this.state.data;
        dataCopy.plurals = d;
        this.setState({
          loadingPluralsData: false
        });
      });

    csv('data/plurals_pcs.csv')
      .then(data => {
        const pcsCopy = this.state.pcs;
        pcsCopy.plurals = data;
        this.setState({
          loadingPluralsPcs: false
        });
      });

    json('data/tensep2.json')
      .then(d => {
        const dataCopy = this.state.data;
        dataCopy.tense = d;
        this.setState({
          loadingTenseData: false
        });
      });

    csv('data/tense_pcs.csv')
      .then(data => {
        const pcsCopy = this.state.pcs;
        pcsCopy.tense = data;
        this.setState({
          loadingTensePcs: false
        });
      });

    const onWindowResize = d => {
      this.shorterDebouncedSetState({
        height: 0.9 * window.innerHeight,
        width: 0.5 * window.innerWidth
      });
    };

    window.addEventListener('resize', onWindowResize);

    const handleChangeXAxis = d => {
      this.shorterDebouncedSetState({
        xAxisPcRank: d
      });
    };

    const handleChangeYAxis = d => {
      this.shorterDebouncedSetState({
        yAxisPcRank: d
      });
    };
    // height = width = 775
    this.setState({
      height: 0.9 * window.innerHeight,
      width: 0.5 * window.innerWidth,
      margin: {left: 35, right: 35, bottom: 35, top: 35},
      markSize: 8,
      xAxisPcRank: 0,
      yAxisPcRank: 1,
      handleChangeXAxis,
      handleChangeYAxis
    });
  }

  render() {
    const {loadingNumbersData, loadingNumbersPcs, loadingGenderData, loadingGenderPcs,
      loadingTenseData, loadingTensePcs, loadingPluralsData, loadingPluralsPcs,
      data, pcs,
      height, width, margin, markSize, xAxisPcRank, yAxisPcRank, handleChangeXAxis, handleChangeYAxis,
      hoveringOver, clickedOn, whichDataset, titles, legend, fontSizes} = this.state;


    if (loadingNumbersPcs || loadingNumbersData || loadingGenderPcs || loadingGenderData ||
      loadingTenseData || loadingTensePcs || loadingPluralsData || loadingPluralsPcs) {
      return <div>LOADING DATA</div>;
    }


    const xAxisPc = pcs[whichDataset][xAxisPcRank].pc;
    const yAxisPc = pcs[whichDataset][yAxisPcRank].pc;
    const circleCoordinates = getCircleCoordinatesQuickly(data[whichDataset], xAxisPc, yAxisPc);
    const coorMap = nodeMap(circleCoordinates);

    const handleHover = d => {
      // console.log(d)
      if (coorMap[d.sourceWord] === undefined) {
        this.setState({
          hoveringOver: null
        });
      }
      this.debouncedSetState({
        hoveringOver: d
      });
    };

    const handleClick = d => {
      if (clickedOn[d.sourceWord] === undefined) {
        clickedOn[d.sourceWord] = d.sourceWord;
      } else {
        delete clickedOn[d.sourceWord];
      }
    };

    // const handleCheck = d => {
    //   checked[d.target.name] = d.target.checked;
    // };

    const domain = getDomain(circleCoordinates);
    const scaleRadial = scaleLinear().domain([0, 3]).range([0, domain.max]);
    const radialAxesData = getRadialAxesData(scaleRadial, 4);

    const x = scaleLinear().domain([-domain.max, domain.max]).range([margin.left, width - margin.right]);
    const y = scaleLinear().domain([-domain.max, domain.max]).range([height - margin.bottom, margin.top]);

    return (
      <div className="flex flex-column justify-center align-start max-width max-height">
        <div className="max-width almost-max-height flex flex-row">
          <view style={{backgroundColor: '#3395c9', padding: 0, height: 50, width: 3000,
            position: 'relative', top: 0}}>
            <div className="flex justify-center align-self-center">
              <text style={{fontSize: fontSizes.title, color: 'white'}}>
                {titles[whichDataset]}
              </text>
            </div>
          </view>
        </div>
        <div className="flex flex-row justify-start max-width max-height">
          <div className="flex flex-row justify-evenly fortyfive-width max-height">
            <div className="flex flex-column justify-start max-height">
              <br/>
              <view style={{backgroundColor: '#E0F7FA', padding: 15}}>
                <text style={{fontSize: fontSizes.h1, fontWeight: 900}}> What is this? </text>
                <br/><br/>
                <text style={{fontSize: fontSizes.normal}}>
                  <a href="https://www.aclweb.org/anthology/N13-1090">
                    <text style={{color: 'black'}}>In "Linguistic Regularities," Mikolov et al</text>
                  </a>
                  <br/>
                  <text>show that there exist vectors in word</text>
                  <br/>
                  <text>embedding space which seem to encode</text>
                  <br/>
                  <text>grammar. For instance,</text>
                  <br/><br/>
                  <text style={{fontWeight: 'bold', textAlign: 'center'}}> Queen - Woman = King - Man</text>
                  <br/><br/>
                  <text>We found this remarkable! We wondered if</text>
                  <br/>
                  <text>doing PCA would </text>
                  <text>allow us to visually</text>
                  <br/>
                  <text>explore grammar vectors in word</text>
                  <br/>
                  <text>embedding space... </text>
                  <br/><br/>
                  <text>Happy exploring!</text>
                </text>
              </view>
              <br/>
              <view style={{backgroundColor: '#fdf6e3', padding: 15}}>
                <text style={{fontSize: fontSizes.h1, fontWeight: 900}}> How to read? </text>
                <br/><br/>
                <text style={{fontSize: fontSizes.h3}}>
                  <text style={{fontWeight: 'bold'}}>Origin: </text>
                  <text>{legend[whichDataset].origin} </text> <br/>
                  <text style={{fontWeight: 'bold'}}>Marks: </text>
                  <text>{legend[whichDataset].marks}</text> <br/> <br/>
                </text>
                <text style={{fontSize: fontSizes.normal}}>
                  <text>This plot is interested in relative direction.</text> <br/><br/>
                  <text>Think of it as a compass.</text> <br/><br/>
                  <text style={{textAlign: 'center', fontWeight: 'bold'}}>
                    It answers the following question for you:</text> <br/><br/>
                  <text style={{textAlign: 'center', fontStyle: 'italic', fontSize: fontSizes.normal}}>
                    If I'm standing at the {legend[whichDataset].origin} version of a word, </text> <br/>
                  <text style={{textAlign: 'center', fontStyle: 'italic', fontSize: fontSizes.normal}}>
                    how do I get to the {legend[whichDataset].marks} version? </text> <br/>
                </text>
              </view>
            </div>
            <div className="flex flex-column justify-start max-height">
              <br/>
              <view style={{backgroundColor: 'rgb(250,250,250)', padding: 20}}>
                <text style={{fontSize: fontSizes.h1, fontWeight: 900}}>
                  CONTROL PANEL</text>
                <br/> <br/>
                <div style={{width: width * 0.3}}>
                  <text style={{fontSize: fontSizes.h2}}> Select Sample Set </text>
                  <form>
                    <Select name="input" value={whichDataset}
                      onChange={d => {
                        this.setState({
                          hoveringOver: null,
                          clickedOn: {},
                          whichDataset: d.target.value
                        });
                      }}>
                      <Option value="numbers" label="Numbers" />
                      <Option value="gender" label="Gender" />
                      <Option value="plurals" label="Plurals" />
                      <Option value="tense" label="Tense" />
                    </Select>
                  </form>
                </div>
                <br/>
                <div className="flex flex-column align-center">
                  <text style={{fontSize: fontSizes.h3}}>X-Axis PC Slider </text>
                  <br/>
                  <div className="flex flex-row justify-between max-width">
                    <button onClick={(a, val) => {
                      if (xAxisPcRank > 0) {
                        this.setState({
                          xAxisPcRank: xAxisPcRank - 1
                        });
                      }
                    }}> <GoChevronLeft /> </button>
                    <div className="x-slider" style={{width: width * 0.2, height: height * 0.06}}>
                      <Slider
                         min={0}
                         max={299}
                         value={xAxisPcRank}
                         onChange={handleChangeXAxis}
                         labels={{0: 'Hi Var', 299: 'Low'}}
                       />
                    </div>
                    <button onClick={(a, val) => {
                      if (xAxisPcRank < 299) {
                        this.setState({
                          xAxisPcRank: xAxisPcRank + 1
                        });
                      }
                    }}> <GoChevronRight /> </button>
                  </div>
                  <br/> <br/>
                  <text style={{fontSize: fontSizes.normal}}>
                    <text style={{fontWeight: 'bold'}}>Variance Rank (within sample): </text>
                    {`${xAxisPcRank}`}
                  </text>
                  <text style={{fontSize: fontSizes.normal}}>
                    <text style={{fontWeight: 'bold'}}>Variance Ratio (within sample): </text>
                    {`${Number(Number(pcs[whichDataset][xAxisPcRank].var).toPrecision(3) * 100)
                        .toFixed(3)}%`}
                  </text>
                </div>
                <br/><br/>
                <div className="flex flex-column align-center">
                  <text style={{fontSize: fontSizes.h3}}>Y-Axis PC Slider </text>
                  <br/>
                  <div className="flex flex-row justify-between max-width">
                    <button onClick={(a, val) => {
                      if (yAxisPcRank > 0) {
                        this.setState({
                          yAxisPcRank: yAxisPcRank - 1
                        });
                      }
                    }}> <GoChevronLeft /> </button>
                    <div className="y-slider" style={{width: width * 0.2, height: height * 0.06}}>
                      <Slider
                       min={0}
                       max={299}
                       value={yAxisPcRank}
                       onChange={handleChangeYAxis}
                       labels={{0: 'Hi Var', 299: 'Low'}}
                     />
                    </div>
                    <button onClick={(a, val) => {
                      if (yAxisPcRank < 299) {
                        this.setState({
                          yAxisPcRank: yAxisPcRank + 1
                        });
                      }
                    }}> <GoChevronRight /> </button>
                  </div>
                  <br/> <br/>
                  <text style={{fontSize: fontSizes.normal}}>
                    <text style={{fontWeight: 'bold'}}>Variance Rank (within sample): </text>
                    {`${yAxisPcRank}`}
                  </text>
                  <text style={{fontSize: fontSizes.normal}}>
                    <text style={{fontWeight: 'bold'}}>Variance Ratio (within sample): </text>
                    {`${Number(Number(pcs[whichDataset][yAxisPcRank].var).toPrecision(3) * 100)
                        .toFixed(3)}%`}
                  </text>
                </div>
                <br/>
              </view>
              <br/>
              <view style={{backgroundColor: '#e55d87', padding: 10}}>
                <a href="https://www.notion.so/rheza/More-on-the-vis-c37abce205fa472bafd0f520685a2786">
                  <text style={{color: 'white', fontSize: fontSizes.h3, fontStyle: 'italic'}}>
                    Click here to learn more
                  </text>
                </a>
              </view>
            </div>
          </div>
          {
            // width={width} height={height} margin={margin}
          }
          <div className="flex flex-row flex-start half-width">
            <XYPlot width={width} height={height} margin={margin}
              xDomain={[-domain.max, domain.max]} yDomain={[-domain.max, domain.max]}
             onMouseLeave={() => this.debouncedSetState({hoveringOver: null})} >
              <XAxis title={`PC ${xAxisPc}`} on0={true} tickTotal={0}
               style={{
                 title: {fontSize: fontSizes.h2},
                 line: {stroke: 'gray'},
                 ticks: {stroke: '#ADDDE1'},
                 text: {stroke: 'none', fill: '#6b6b76', fontWeight: 600}}} />
              <YAxis title={`PC ${yAxisPc}`} on0={true} tickValues={[-domain.max]}
               style={{
                 title: {fontSize: fontSizes.h2},
                 line: {stroke: 'gray'},
                 ticks: {stroke: '#ADDDE1'},
                 text: {stroke: 'none', fill: '#6b6b76', fontWeight: 600, fontSize: fontSizes.h3}}} />
              <ArcSeries
               className="radialAxes"
               colorType="literal"
               color="gray"
               stroke="gray"
               opacity="0.5"
               data={radialAxesData} />
              {
              hoveringOver &&
              <LineSeries
              className="guide"
              stroke="gray"
              opacity="0.6"
              data={getGuidelineData(domain, [hoveringOver])[0]}
              />
              }
              {
                // Object.values(clickedOn).map((curr, index) => {
                //   return (
                //     <LineSeries
                //       key={`guide-click-${curr}`}
                //       className="guide-click"
                //       stroke="gray"
                //       opacity="0.6"
                //       data={getGuidelineData(domain, [coorMap[curr]])[0]}
                //       />
                //   );
                // })
              }
              <MarkSeries
               data={circleCoordinates}
               animation
               className="targetMarks"
               fill="#5ec9e6"
               stroke="#5ec9e6"
               size={markSize} />
              <MarkSeries
               data={Object.values(clickedOn).map((curr, index) => {
                 return coorMap[curr];
               })}
               animation
               className="clickedMarks"
               fill="#e55d87"
               stroke="#e55d87"
               size={markSize} />
              {hoveringOver &&
              <MarkSeries
               data={[coorMap[hoveringOver.sourceWord]]}
               className="hoveringMarks"
               fill="#ff9400"
               stroke="#ff9400"
               size={markSize} />
              }
              <LabelSeries
               data={circleCoordinates}
               animation
               className="targetLabels"
               getLabel={d => d.targetWord}
               getX={d => d.x + 0.02 * domain.max}
               getY={d => d.y}
               labelAnchorX="start"
               labelAnchorY="start"
               style={{fontSize: fontSizes.small, fontFamily: 'sans-serif', fill: '#5f5f5f'}} />
              {
               //
              }
              <Voronoi
               className="voronoi"
               extent={[[margin.left, margin.top], [width - margin.right, height - margin.top]]}
               nodes={circleCoordinates}
               polygonStyle={{
                 // UNCOMMENT BELOW TO SEE VORNOI
                 // stroke: 'rgba(0, 0, 0, .2)'
               }}
               x={d => xAxisPcRank === yAxisPcRank ? 0 : x(d.x)}
               y={d => y(d.y)}
               onHover={handleHover}
               onClick={handleClick} />
              {hoveringOver &&
              <Hint value={coorMap[hoveringOver.sourceWord]} align={{horizontal: 'right'}} animation>
                {hoveringOver.targetWord}
              </Hint>}
              {Object.values(clickedOn).map((curr, index) => {
                return (
                  <Hint key={`hint-${curr}`} value={coorMap[curr]}
                    align={{horizontal: 'right'}} key={curr.targetWord}>
                    {coorMap[curr].targetWord}
                  </Hint>
                );
              })}
              {hoveringOver &&
              <Hint value={{x: 0, y: 0}} align={{horizontal: 'right'}}>
                {hoveringOver.sourceWord}
              </Hint>}
            </XYPlot>
          </div>
        </div>
      </div>
    );
  }
}
RootComponent.displayName = 'RootComponent';
export default RootComponent;

/* Cartesian Plot */

// <XYPlot width={width} height={height} margin={margin}>
//   <GradientDefs>
//     <linearGradient id="gradient-to-right" x1="0" x2="1" y1="0" y2="0">
//       <stop offset="0%" stopColor="#4DA0B0" />
//       <stop offset="100%" stopColor="#d39d38" />
//     </linearGradient>
//     <linearGradient id="gradient-to-left" x1="1" x2="0" y1="0" y2="0">
//       <stop offset="0%" stopColor="#4DA0B0" />
//       <stop offset="100%" stopColor="#d39d38" />
//     </linearGradient>
//     <linearGradient id="gradient-to-top" x1="0" x2="0" y1="0" y2="1">
//       <stop offset="0%" stopColor="#4DA0B0" />
//       <stop offset="100%" stopColor="#d39d38" />
//     </linearGradient>
//     <linearGradient id="gradient-to-bottom" x1="0" x2="0" y1="1" y2="0">
//       <stop offset="0%" stopColor="#4DA0B0" />
//       <stop offset="100%" stopColor="#d39d38" />
//     </linearGradient>
//   </GradientDefs>
//   <XAxis title={`PC ${data[0][0].xAxis}`}/>
//   <YAxis title={`PC ${data[0][0].yAxis}`}/>
//   {data.map((curr, index) => {
//     return (
//       <LineMarkSeries
//         key={index}
//         data={curr}
//         markStyle={{
//           fill: 'red',
//           stroke: 'red'
//         }}
//         lineStyle={{
//           stroke: 'black'
//         }}
//         />
//     );
//   })}
// </XYPlot>
