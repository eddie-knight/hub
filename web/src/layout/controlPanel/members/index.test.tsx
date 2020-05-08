import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { mocked } from 'ts-jest/utils';

import { API } from '../../../api';
import { AppCtx } from '../../../context/AppCtx';
import { User } from '../../../types';
import MembersSection from './index';
jest.mock('../../../api');

const getMembers = (fixtureId: string): User[] => {
  return require(`./__fixtures__/index/${fixtureId}.json`) as User[];
};

const onAuthErrorMock = jest.fn();

const defaultProps = {
  onAuthError: onAuthErrorMock,
};

const mockCtx = {
  user: { alias: 'test', email: 'test@test.com' },
  prefs: {
    controlPanel: {
      selectedOrg: 'orgTest',
    },
    search: { limit: 25 },
  },
};

describe('Members section index', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates snapshot', async () => {
    const mockMembers = getMembers('1');
    mocked(API).getOrganizationMembers.mockResolvedValue(mockMembers);

    const result = render(
      <AppCtx.Provider value={{ ctx: mockCtx, dispatch: jest.fn() }}>
        <Router>
          <MembersSection {...defaultProps} />
        </Router>
      </AppCtx.Provider>
    );

    await waitFor(() => {
      expect(result.asFragment()).toMatchSnapshot();
    });
  });

  describe('Render', () => {
    it('renders component', async () => {
      const mockMembers = getMembers('2');
      mocked(API).getOrganizationMembers.mockResolvedValue(mockMembers);

      render(
        <AppCtx.Provider value={{ ctx: mockCtx, dispatch: jest.fn() }}>
          <Router>
            <MembersSection {...defaultProps} />
          </Router>
        </AppCtx.Provider>
      );

      await waitFor(() => {
        expect(API.getOrganizationMembers).toHaveBeenCalledTimes(1);
      });
    });

    it('displays no data component when no members', async () => {
      const mockMembers = getMembers('4');
      mocked(API).getOrganizationMembers.mockResolvedValue(mockMembers);

      const { getByTestId, getByText } = render(
        <AppCtx.Provider value={{ ctx: mockCtx, dispatch: jest.fn() }}>
          <Router>
            <MembersSection {...defaultProps} />
          </Router>
        </AppCtx.Provider>
      );

      const noData = await waitFor(() => getByTestId('noData'));

      expect(noData).toBeInTheDocument();
      expect(getByText('Do you want to add a member?')).toBeInTheDocument();
      expect(getByTestId('addFirstMemberBtn')).toBeInTheDocument();

      await waitFor(() => {});
    });

    it('renders 2 members card', async () => {
      const mockMembers = getMembers('5');
      mocked(API).getOrganizationMembers.mockResolvedValue(mockMembers);

      const { getAllByTestId } = render(
        <AppCtx.Provider value={{ ctx: mockCtx, dispatch: jest.fn() }}>
          <Router>
            <MembersSection {...defaultProps} />
          </Router>
        </AppCtx.Provider>
      );

      const cards = await waitFor(() => getAllByTestId('memberCard'));
      expect(cards).toHaveLength(2);

      await waitFor(() => {});
    });

    it('renders organization form when add org button is clicked', async () => {
      const mockMembers = getMembers('6');
      mocked(API).getOrganizationMembers.mockResolvedValue(mockMembers);

      const { getByTestId, queryByText } = render(
        <AppCtx.Provider value={{ ctx: mockCtx, dispatch: jest.fn() }}>
          <Router>
            <MembersSection {...defaultProps} />
          </Router>
        </AppCtx.Provider>
      );

      const addBtn = await waitFor(() => getByTestId('addMemberBtn'));
      expect(addBtn).toBeInTheDocument();

      expect(queryByText('Username')).toBeNull();

      fireEvent.click(addBtn);
      expect(queryByText('Username')).toBeInTheDocument();

      await waitFor(() => {});
    });

    it('renders organization form when add org button is clicked', async () => {
      const mockMembers = getMembers('7');
      mocked(API).getOrganizationMembers.mockResolvedValue(mockMembers);

      const { getByTestId, queryByText } = render(
        <AppCtx.Provider value={{ ctx: mockCtx, dispatch: jest.fn() }}>
          <Router>
            <MembersSection {...defaultProps} />
          </Router>
        </AppCtx.Provider>
      );

      const firstBtn = await waitFor(() => getByTestId('addFirstMemberBtn'));
      expect(queryByText('Username')).toBeNull();
      expect(firstBtn).toBeInTheDocument();

      fireEvent.click(firstBtn);
      expect(queryByText('Username')).toBeInTheDocument();

      await waitFor(() => {});
    });
  });

  describe('on getOrganizationMembers error', () => {
    it('401 error', async () => {
      mocked(API).getOrganizationMembers.mockRejectedValue({
        statusText: 'ErrLoginRedirect',
      });

      render(
        <AppCtx.Provider value={{ ctx: mockCtx, dispatch: jest.fn() }}>
          <Router>
            <MembersSection {...defaultProps} />
          </Router>
        </AppCtx.Provider>
      );

      await waitFor(() => expect(API.getOrganizationMembers).toHaveBeenCalledTimes(1));

      expect(onAuthErrorMock).toHaveBeenCalledTimes(1);
    });

    it('rest API errors - displays generic error message', async () => {
      mocked(API).getOrganizationMembers.mockRejectedValue({ status: 400 });

      const { getByTestId, getByText } = render(
        <AppCtx.Provider value={{ ctx: mockCtx, dispatch: jest.fn() }}>
          <Router>
            <MembersSection {...defaultProps} />
          </Router>
        </AppCtx.Provider>
      );

      await waitFor(() => expect(API.getOrganizationMembers).toHaveBeenCalledTimes(1));

      const noData = getByTestId('noData');
      expect(noData).toBeInTheDocument();
      expect(
        getByText(/An error occurred getting the organization members, please try again later/i)
      ).toBeInTheDocument();

      await waitFor(() => {});
    });
  });
});
