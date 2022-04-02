
import { HttpParams } from '@angular/common/http';
import { convertToQueries } from './query-params.utils';

describe('Query Params Utils', () => {
    it('should return previous params object', () => {
        const params = new HttpParams();
        const result = convertToQueries(params);
        expect(result).toEqual(params);
    });

    it('should convert object to query params', () => {
        const params = new HttpParams();
        const query = { site_id: 1, study_id: undefined };
        const result = convertToQueries(params, query);

        expect(result.get('site_id')).toEqual('1');
        expect(result.get('study_id')).toBeFalsy();
    })
})