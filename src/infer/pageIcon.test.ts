import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import * as fileType from 'file-type';

import { pageIcon } from './pageIcon';

jest.mock('file-type', () => ({
  fromBuffer: jest.fn(),
}));

function buildAxiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    config: {} as unknown as InternalAxiosRequestConfig<unknown>,
  };
}

test('it returns the preferred page icon extension', async () => {
  const pngBuffer = Buffer.alloc(100, 1);
  const icoBuffer = Buffer.alloc(10, 2);
  const ignoredBuffer = Buffer.alloc(5, 3);
  const axiosGetMock = jest.spyOn(axios, 'get');
  const fileTypeFromBufferMock = fileType.fromBuffer as jest.Mock;

  axiosGetMock.mockImplementation((url) => {
    if (url === 'https://example.com/path/page') {
      return Promise.resolve(
        buildAxiosResponse(`
          <html>
            <head>
              <link rel="icon" href="icon.png">
              <meta property="og:image" content="/icon.ico">
            </head>
          </html>`),
      );
    }
    if (url === 'https://example.com/path/icon.png') {
      return Promise.resolve(buildAxiosResponse(pngBuffer));
    }
    if (url === 'https://example.com/icon.ico') {
      return Promise.resolve(buildAxiosResponse(icoBuffer));
    }
    return Promise.resolve(buildAxiosResponse(ignoredBuffer));
  });

  fileTypeFromBufferMock.mockImplementation((data) => {
    if (Buffer.from(data).length === pngBuffer.length) {
      return Promise.resolve({
        ext: 'png',
        mime: 'image/png',
      } as fileType.FileTypeResult);
    }
    if (Buffer.from(data).length === icoBuffer.length) {
      return Promise.resolve({
        ext: 'ico',
        mime: 'image/x-icon',
      } as fileType.FileTypeResult);
    }
    return Promise.resolve(undefined);
  });

  const result = await pageIcon('https://example.com/path/page', {
    ext: '.ico',
  });

  expect(result).toEqual({
    data: icoBuffer,
    ext: '.ico',
    size: icoBuffer.length,
  });
  expect(axiosGetMock).toHaveBeenCalledWith('https://example.com/path/page', {
    responseType: 'text',
  });
  expect(axiosGetMock).toHaveBeenCalledWith(
    'https://example.com/path/icon.png',
    {
      responseType: 'arraybuffer',
    },
  );
});
