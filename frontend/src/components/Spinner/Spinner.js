import React from 'react';

import './Spinner.css';

const spinner = () => {
    return (
    <div className="spinner">
        <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
    </div>
    );
}

export default spinner;