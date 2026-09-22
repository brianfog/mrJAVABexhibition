import { useContext } from "react";
import Modal from "../Modal/Modal";
import './ISWrong.css';
import context_catch from "../../configureContext";


const IsWrongModal = ({isOPen ,onClose}) => {

const {WrongAnswer} = useContext(context_catch);

return (
<Modal isOpen={isOPen} onClose={onClose}>

    <div className="Wrong_Answer">

        <h1>
            جواب اشتباه
        </h1>

        <p>
            {WrongAnswer}
        </p>

    </div>

    <div className="Correct_Answer">

        <h1>
            جواب صحیح
        </h1>

        <textarea/>

    </div>

    <button className="Send-Correction">
        ارسال
    </button>

</Modal>

)


};

export default IsWrongModal;