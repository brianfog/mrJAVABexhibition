import Hero from "../components/Hero/Hero";
import PlansComponent from "../components/Plans/Plans"

const VIPlans = () => {
  return (
    <>
      <Hero hideChatInput={true}/>
      <PlansComponent VIP={true}/>
    </>
  );
};

export default VIPlans;