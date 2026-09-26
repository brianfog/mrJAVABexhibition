import { useContext, useRef, useState } from "react";
import Modal from "../Modal/Modal";
import './ISWrong.css';
import context_catch from "../../configureContext";
import { apiRequest } from "../../services/api";


const IsWrongModal = ({isOPen ,onClose}) => {

const {WrongAnswer, Global_ChatID} = useContext(context_catch);

const [CorrectA, setCorrectA] = useState('');

const [Loading , SetLoading] = useState(false);

const SendWrongRef = useRef(null);

const SendWrong = async () => {

    if (!Global_ChatID) return;

    const WrongBody = {
        'chat_id': Global_ChatID,
        'chat_message': `${WrongAnswer}`,
        'note': `${CorrectA}`,
    }

    SetLoading(true);

    SendWrongRef.current.innerText = 'در حال ارسال';

    try{

        const Response= await apiRequest(`/challenge-notes`, {method: 'POST', body : WrongBody});

        if (Response) {
            SendWrongRef.current.innerText = `ارسال شد`
        }

    }catch(error){

        console.log(error);

        SetLoading(false);

        SendWrongRef.current.innerText = 'دوباره تلاش کن';

    }


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
    ref={SendWrongRef}
    className="Send-Correction"
    onClick={SendWrong}
    disabled={Loading}
    >
        ارسال
    </button>

</Modal>

)


};

export default IsWrongModal;