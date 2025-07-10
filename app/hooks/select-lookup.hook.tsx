'use client';

import { useLookUpList } from "@/queries/misc.query";
import { LookupData } from "@/rumsan/types/raman/misc.type";


export const findByName = <T extends keyof LookupData>(
  data: LookupData,
  type: T,
  lookupKey: string,
): LookupData[T][number] | undefined => {
  return data[type].find((item) => item.cuid === lookupKey);
};

export const useSelectLookUp = <T extends keyof LookupData>() => {
  const { data } = useLookUpList();

  const accounts =
    data?.accounts.map((item) => ({
      ...item,
      label: item.name,
      value: item.cuid,
    })) || [];

  const categories =
    data?.categories.map((item) => ({
      ...item,
      label: item.group + ' - ' + item.name,
      value: item.cuid,
    })) || [];

  const projects =
    data?.projects.map((item) => ({
      ...item,
      label: item.name,
      value: item.cuid,
    })) || [];

  const users =
    data?.users.map((item) => ({
      ...item,
      label: item.name,
      value: item.cuid,
    })) || [];

  const departments =
    data?.departments.map((item) => ({
      ...item,
      label: item.name,
      value: item.cuid,
    })) || [];

  const clients =
    data?.clients.map((item) => ({
      ...item,
      label: item.name,
      value: item.cuid,
    })) || [];

  //if (!data) return undefined; // Explicitly return undefined when data is not available
  return {
    accounts,
    categories,
    projects,
    users,
    departments,
    clients,
    lookupByCuid: (group: T, cuid: string) =>
      data ? data[group]?.find((item) => item.cuid === cuid) : null,
  };
};
