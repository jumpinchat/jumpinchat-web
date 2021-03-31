import * as chatUtils from './chatUtils';

describe('chatUtils', () => {
  describe('getUserMentioned', () => {
    it('should return match if handle is in message', () => {
      const mentioned = chatUtils.getUserMentioned('@foo: bar', 'foo');
      expect(mentioned.length).toEqual(2);
    });

    it('should return match if handle is in message and requires escape', () => {
      const mentioned = chatUtils.getUserMentioned('@foo[foo: bar', 'foo[foo');
      expect(mentioned.length).toEqual(2);
    });

    it('should return match if username is in message', () => {
      const mentioned = chatUtils.getUserMentioned('@foo: bar', 'baz', 'foo');
      expect(mentioned.length).toEqual(2);
    });

    it('should return null if there is no match', () => {
      const mentioned = chatUtils.getUserMentioned('@foo: bar', 'baz', 'boz');
      expect(mentioned).toEqual(null);
    });
  });
});
