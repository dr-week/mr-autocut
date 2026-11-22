import { bridgeAddrSig } from './controls';
import { segmentsSig, sequenceSig } from './signals';

export const scriptPayload = () => ({ segments: segmentsSig.value, sequence: sequenceSig.value, bridge_addr: bridgeAddrSig.value || null });
