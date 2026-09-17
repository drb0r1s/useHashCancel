import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";

export const useHashCancel = ({ hash, state, setState }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const keyRef = useRef("");
    const initialRenderRef = useRef({ location: true, state: true });

    useEffect(() => {
        if(location.hash) navigate(`${location.pathname}`);
    }, []);
    
    useEffect(() => {
        if(initialRenderRef.current.location) {
            initialRenderRef.current.location = false;
            return;
        }
        
        if(typeof state === "object") {
            if(location.hash !== `#${keyRef.current}` && state[keyRef.current]) setState(prevState => { return {...prevState, [keyRef.current]: false} });
        }

        else {
            if(location.hash !== `#${hash}` && state) setState(false);
        }
    }, [location.hash]);
    
    useEffect(() => {
        if(initialRenderRef.current.state) {
            initialRenderRef.current.state = false;
            return;
        }
        
        if(typeof state === "object") {
            let noNew = true;
            
            Object.keys(state).forEach((key, index) => {
                const value = Object.values(state)[index];
                
                if(value) {
                    navigate(`${location.pathname}#${key}`, { replace: false });
                    
                    noNew = false;
                    keyRef.current = key;
                }
            });

            const hashKey = location.hash.substring(1);
            
            if(hashKey && !state[hashKey] && noNew) {
                navigate(`${location.pathname}`, { replace: false });
                keyRef.current = "";
            }
        }

        else {
            if(state) navigate(`${location.pathname}#${hash}`, { replace: false });
            else navigate(`${location.pathname}`, { replace: false });
        }
    }, [state]);
}