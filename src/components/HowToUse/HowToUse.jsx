import './HowToUse.css';
import Offers from '../Offers/Offers';
import { useContext } from 'react';
import context_catch from '../../configureContext';

const HowToUse = ({ data }) => {

  const {spacediv} = useContext(context_catch);

  return (
    <section className="how-to-use">
      <Offers />

      <div className="container">

        { spacediv && (<div className='spaceDiv'>
        </div>)}


        <h2 className="section-title">چطوری استفاده کنم</h2>
        <p className="section-subtitle">مراحل استفاده از مستر جواب</p>
        <div className="steps-container">
          {data.map((step, index) => (
            <div
              key={index}
              className={`step-card ${step.reverse ? 'step-reverse' : ''}`}
            >
              <div className="step-content">
                <div className="step-left">
                  <div className="step-number">{step.number}</div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
                <div className="step-right">
                  <div className="step-icon-box">
                    <img
                      src={step.image}
                      alt={`Step ${step.number}`}
                      className="step-icon"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowToUse;
