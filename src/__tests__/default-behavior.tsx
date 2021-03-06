import { renderHook, cleanup, act } from "react-hooks-testing-library";
import useTask, { timeout } from "..";

afterEach(cleanup);

function perform(result) {
  result.current[0]();
}

function stateFor(result) {
  return result.current[1];
}

test("it can perform some synchronous work", async () => {
  const done = jest.fn();

  const { result, waitForNextUpdate } = renderHook(() => useTask(done));

  act(() => perform(result));

  await waitForNextUpdate();

  expect(done).toBeCalled();
});

test("it can perform an async function", async () => {
  const done = jest.fn();

  const { result, waitForNextUpdate } = renderHook(() =>
    useTask(async () => {
      await timeout(0);
      done();
    })
  );

  expect(stateFor(result).isRunning).toBe(false);
  expect(stateFor(result).performCount).toBe(0);

  act(() => perform(result));

  expect(stateFor(result).isRunning).toBe(true);

  await waitForNextUpdate();

  expect(done).toBeCalled();
  expect(stateFor(result).isRunning).toBe(false);
});

test("it can perform a generator function", async () => {
  const done = jest.fn();

  const { result, waitForNextUpdate } = renderHook(() =>
    useTask(function*() {
      yield timeout(0);
      done();
    })
  );

  expect(stateFor(result).isRunning).toBe(false);
  expect(stateFor(result).performCount).toBe(0);

  act(() => perform(result));

  expect(stateFor(result).isRunning).toBe(true);

  await waitForNextUpdate();

  expect(done).toBeCalled();
  expect(stateFor(result).isRunning).toBe(false);
});
