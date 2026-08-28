import Hero from '../components/Hero/Hero';
import PlansComponent from '../components/Plans/Plans';

const Plans = () => {
  return (
    <>
      <Hero hideChatInput={true} />
      <PlansComponent VIP={false} />
    </>
  );
};

export default Plans;
