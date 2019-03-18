import React from 'react';

import './EventItem.css';

const eventItem = props => (
    <li key={props.eventId} className="events__item">
        <div>
            <h1>{props.title}</h1>
            <h2>{props.price} PLN <span>{new Date(props.date).toLocaleDateString()}</span></h2>
        </div>
        <div>
            {props.userId === props.creatorId ? 
                <p>You are the owner of this event</p> : 
                <button className="btn" onClick={props.onDetail.bind(this, props.eventId)}>
                    View Details
                </button> 
            }

        </div>
    </li>
);

export default eventItem;