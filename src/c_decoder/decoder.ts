
class Decoder extends EventTarget {
    
    _decoder: IDecoder;

    constructor() {
        super();
        let decoderModule = window.Module.Decoder;
        this._decoder =  new decoderModule();
    }

    decode() {
        
    }

}