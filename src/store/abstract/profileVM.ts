import { TypeOf } from 'io-ts';
import { pipe, Either as E, isRight } from 'utils/fp';
import { parseAndValidateToken } from 'utils/utils';
import { InitLogger } from 'utils/Logger';
import { State, Computed, Methods, Run } from 'utils/Init';
import { User, Visibility } from 'clientApi';
import { TokenSchema } from 'schemas/token-content-schema';
import * as Swagger from 'clientApi';
import { ModalServiceType } from './modalVM';
import { autorun } from 'mobx';

type Params = {
  onModeChange: (mode: null | Visibility.PLATFORM | Visibility.USER) => void;
  initActivation: false | { userId: string; userCode: string };
  modalService: ModalServiceType;
};

export default function({ initActivation, onModeChange, modalService }: Params) {
  type TokenContent = TypeOf<typeof TokenSchema>;
  const logger = InitLogger({ filename: 'profileVM.ts', dirname: 'store/abstract' });
  const userApi = (token?: string) =>
    Swagger.UserApiFactory(new Swagger.Configuration({ ...(token && { accessToken: `${token}` }) }));

  return pipe(
    State({
      user: undefined as undefined | User,
      token: null as null | string,
      tokenContent: null as null | TokenContent
    }),
    Computed(({ state }) => {
      const content = state.get().tokenContent;
      return {
        mode: content ? (content.auth.includes('ROLE_ADMIN') ? Visibility.PLATFORM : Visibility.USER) : null
      };
    }),
    Methods(({ state, setState, clear }) => {
      const { token, user } = state.get();
      return {
        refreshUser: async () => {
          if (user && token) {
            userApi(token)
              .getUserById(user.id)
              .then(({ data }) => setState({ user: data }))
              .catch(e => logger.error('failed to fetchCurrentUser', e));
          }
        },
        login(token: string) {
          return pipe(
            parseAndValidateToken(token),
            E.chain(tokenContent => {
              const isExpired = new Date(tokenContent.exp * 1000).getTime() <= new Date().getTime();
              return isExpired ? E.left([{ message: 'Token Expired', value: tokenContent, context: [] }]) : E.right(tokenContent);
            }),
            E.fold(
              e => {
                logger.validationError('JWT parse', e);
                return E.left(e);
              },
              tokenContent => {
                setState({ tokenContent, token });

                userApi(token)
                  .getUserById(tokenContent.sub)
                  .then(({ data: user }) => setState({ user }))
                  .catch(e => logger.error('failed to fetchCurrentUser', e));
                return E.right(null);
              }
            )
          );
        },
        logOut() {
          clear();
        }
      };
    }),
    Run(async ({ state, methods, computed }) => {
      if (initActivation) {
        try {
          const { data } = await userApi().activateUser(initActivation.userId, initActivation.userCode);

          const loginResult = methods.login(data.token);

          if (isRight(loginResult)) {
            modalService.success({
              content: 'Activation Success!'
            });
          } else {
            throw loginResult.left;
          }
        } catch {
          modalService.error({ title: 'User Activation Failure' });
        }
      } else {
        const token = window.localStorage.getItem('JWT');
        if (token) {
          methods.login(token);
        }
      }

      autorun(() => {
        const token = state.get().token;
        if (token) {
          window.localStorage.setItem('JWT', token);
        } else {
          window.localStorage.removeItem('JWT');
        }
      });

      computed.observe(({ newValue, oldValue }) => {
        if (oldValue) {
          if (newValue.mode !== oldValue.mode) {
            onModeChange(newValue.mode);
          }
        }
      }, true);
    })
  );
}
