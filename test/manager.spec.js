/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {createWidgetManager} from '../dist/manager.dev.js';

/**
 * Helper which adapts the widget state notebook format to the public API
 * format.
 */
class FakeState {
  constructor(state) {
    this.state = state;
  }

  async getModelState(modelId) {
    const state = this.state[modelId];
    return {
      modelModule: state.model_module,
      modelName: state.model_name,
      modelModuleVersion: state.model_module_version,
      state: state.state,
    }
  }
}

describe('widget manager', () => {
  let container;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    container.remove();
  });

  it('can render a threejs scene', async () => {
    const modelId = 'pythree_example_model_007';
    const state = await (await fetch('/base/test/jupyter_threejs_state.json')).json();

    const provider = new FakeState(state);
    const manager = createWidgetManager(provider);

    await manager.render(modelId, container);
    const threeJs = container.querySelector('.jupyter-threejs canvas');
    expect(threeJs).toBeInstanceOf(HTMLCanvasElement);
  });

  it('can render ipyleaflet', async () => {
    const modelId = '34baf5762f2344e19200892a8efafc27';
    const state = await (await fetch('/base/test/leaflet_state.json')).json();

    const provider = new FakeState(state);
    const manager = createWidgetManager(provider);

    await manager.render(modelId, container);
    const leaflet = container.querySelector('.leaflet-widgets');
    expect(leaflet).toBeInstanceOf(HTMLDivElement);
  });

  it('throws for invalid specs', async () => {
    const provider = new FakeState({
      '123': {
        state: {},
      }
    });
    const oldHandler = window.onerror;
    window.onerror = () => {};
    const manager = createWidgetManager(provider);
    await expectAsync(manager.render('123', container)).toBeRejected();
    await new Promise((resolve)=> setTimeout(resolve, 100));
    window.onerror = oldHandler;
  });
});