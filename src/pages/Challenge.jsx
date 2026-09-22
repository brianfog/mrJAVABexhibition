import FAQ from "../components/FAQ/FAQ";
import Features from "../components/Features/Features";
import Hero from "../components/Hero/Hero";
import HowToUse from "../components/HowToUse/HowToUse";
import Testimonials from "../components/Testimonials/Testimonials";



const Challenge = () => {

    const HOW_TO_USE_DATA = [
    {
      number: 1,
      title: 'مسترجواب رو به یک چالش دعوت کن.',
      description:
        'هر سوالی که مد نظرتون هست رو از مسترجواب بپرسید.',
      image: '/images/success.png',
      reverse: false,
    },
    {
      number: 2,
      title: ' جواب رو بررسی کن.',
      description:
        'اگر جواب به نظرت غلط اومد میتونی اون رو با فشار دادن کلید ضرب در بالای جواب گزارش کن',
      image: '/images/failed.png',
      reverse: true,
    },
    {
      number: 3,
      title: 'جایزه ببر !',
      description:
        'به ازای هر گزارش صحیح یک امتیاز VIP کسب کن !!',
      image: '/images/success-check.png',
      reverse: false,
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

export default Challenge;