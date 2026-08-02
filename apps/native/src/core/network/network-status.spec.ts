import { onNetworkReconnect } from "./network-status";

let capturedListener: ((event: { isConnected?: boolean }) => void) | undefined;
const mockRemove = jest.fn();

jest.mock("expo-network", () => ({
  addNetworkStateListener: jest.fn((listener: (event: { isConnected?: boolean }) => void) => {
    capturedListener = listener;
    return { remove: mockRemove };
  }),
}));

describe("onNetworkReconnect", () => {
  beforeEach(() => {
    capturedListener = undefined;
    mockRemove.mockClear();
  });

  it("does not fire on the initial listener registration", () => {
    const callback = jest.fn();
    onNetworkReconnect(callback);

    expect(callback).not.toHaveBeenCalled();
  });

  it("fires when connectivity transitions from disconnected to connected", () => {
    const callback = jest.fn();
    onNetworkReconnect(callback);

    capturedListener?.({ isConnected: false });
    capturedListener?.({ isConnected: true });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does not fire again on repeated connected events (no transition)", () => {
    const callback = jest.fn();
    onNetworkReconnect(callback);

    capturedListener?.({ isConnected: true });
    capturedListener?.({ isConnected: true });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does not fire again on the disconnect event itself, only on the subsequent reconnect", () => {
    const callback = jest.fn();
    onNetworkReconnect(callback);

    capturedListener?.({ isConnected: true }); // initial connect — fires (1)
    capturedListener?.({ isConnected: false }); // disconnect — no fire
    expect(callback).toHaveBeenCalledTimes(1);

    capturedListener?.({ isConnected: true }); // reconnect — fires (2)
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("stops firing after the returned unsubscribe is called", () => {
    const callback = jest.fn();
    const unsubscribe = onNetworkReconnect(callback);

    unsubscribe();

    expect(mockRemove).toHaveBeenCalled();
  });
});
