import FAQ from "../components/FAQ/FAQ";
import Features from "../components/Features/Features";
import Hero from "../components/Hero/Hero";
import HowToUse from "../components/HowToUse/HowToUse";
import Testimonials from "../components/Testimonials/Testimonials";



const Learning = () => {

    const HOW_TO_USE_DATA = [
    {
      number: 1,
      title: 'از مستر جواب یک سوال بپرسید.',
      description:
        'از مستر جواب یک سوال بپرسید و مستر جواب آن را با تصویر توضیح میدهد.',
      image: '/images/pdf-2.png',
      reverse: false,
    },
    {
      number: 2,
      title: 'مستر جواب آن را شفاف توضیح میدهد.',
      description:
        'مستر جواب تصاویری تولید میکند که جواب را به خوبی منتقل میکنند.',
      image: '/images/summarizer-2.png',
      reverse: true,
    },
    
  ];

    return (
    <>
      <Hero/>
      <HowToUse data={HOW_TO_USE_DATA} />
      <Features />
      <FAQ />
      <Testimonials />
    </>
  );
}

export default Learning;