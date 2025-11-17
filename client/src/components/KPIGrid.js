import React from 'react';
import styled from 'styled-components';

const Grid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
`;

const Card = styled.article`
  background: rgba(15, 23, 42, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5rem;
  padding: 1.1rem;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Label = styled.span`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.7);
`;

const Value = styled.span`
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
`;

const Meta = styled.span`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
`;

const Trend = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #a7f3d0;
`;

const KPIGrid = ({ items = [] }) => (
  <Grid aria-label="Key performance indicators">
    {items.map((item) => (
      <Card key={item.label}>
        <Label>{item.label}</Label>
        <Value>{item.value}</Value>
        {item.meta && <Meta>{item.meta}</Meta>}
        {item.trend && <Trend>{item.trend}</Trend>}
      </Card>
    ))}
  </Grid>
);

export default KPIGrid;
