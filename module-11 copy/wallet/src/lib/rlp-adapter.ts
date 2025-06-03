import * as rlp from 'rlp';

export const RLP = {
  encode: function(data: any): Buffer {
    return rlp.encode(data) as Buffer;
  },
  decode: function(data: Buffer | Uint8Array): any {
    return rlp.decode(data);
  }
}; 