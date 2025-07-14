import React from 'react';
import { ModelRoutingInfoItem, ModelRoutingInfoProps } from '@/types';

export default function ModelRoutingView(props: ModelRoutingInfoProps) {
    const {
        routing
    } = props;

    return (
        <div className="text-sm text-gray-700">
            <div>
                <span className="font-medium">
                    Selected Model:
                </span>
                { routing.selected_model }
            </div>
            <div className="mt-1">
                <span className="font-medium">
                    Routing Scores: 
                </span>
                <ul className="">
                    {
                        Object.entries(routing.scores).map( ([model, score]) => (
                            <li key={model}>
                                {model} : {score.toFixed(4)}
                            </li>

                        ))
                    }
                </ul>
            </div>
        </div>
    )
}