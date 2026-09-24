import { useContext, useState } from "react";
import Modal from "../Modal/Modal";
import './ISWrong.css';
import context_catch from "../../configureContext";
import { apiRequest } from "../../services/api";


const IsWrongModal = ({isOPen ,onClose}) => {

const {WrongAnswer, Global_ChatID} = useContext(context_catch);

const [CorrectA, setCorrectA] = useState('');


const SendWrong = async () => {

    if (!Global_ChatID) return;

    const WrongBody = {
        'chat_id': Global_ChatID,
        'chat_message': `${WrongAnswer}`,
        'note': `${CorrectA}`,
    }

    const Response = await apiRequest(`/challenge-notes`, {method: 'POST', body : WrongBody});
    
    console.log(Response);

}

return (
<Modal isOpen={isOPen} onClose={onClose}>

    <div className="Wrong_Answer">

        <h1>
            جواب اشتباه
        </h1>

        <p>
            {WrongAnswer || 'پاسخی دریافت نشد.'}
        </p>

    </div>

    <div className="Correct_Answer">

        <h1>
            جواب صحیح
        </h1>

        <textarea value={CorrectA} onChange={(e) => setCorrectA(`${e.target.value}`)}/>

    </div>

    <button
    className="Send-Correction"
    onClick={SendWrong}
    >
        ارسال
    </button>

</Modal>

)


};

export default IsWrongModal;